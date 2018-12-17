(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('net'), require('dgram'), require('events')) :
    typeof define === 'function' && define.amd ? define(['net', 'dgram', 'events'], factory) :
    (global.kalm = factory(global.net,global.dgram,global.events));
}(this, (function (net,dgram,events) { 'use strict';

    net = net && net.hasOwnProperty('default') ? net['default'] : net;
    dgram = dgram && dgram.hasOwnProperty('default') ? dgram['default'] : dgram;

    const enabled = ((typeof process === 'object' && process.env.NODE_DEBUG && process.env.NODE_DEBUG.indexOf('kalm') > -1) ||
        (typeof window === 'object' && window['BROWSER_DEBUG'] && window['BROWSER_DEBUG'].indexOf('kalm') > -1));
    function log(msg) {
        if (enabled)
            console.error(msg);
    }
    var logger = { log, enabled };

    function serialize(frameId, channel, packets) {
        const channelLen = channel.length;
        const result = [frameId % 255, channelLen];
        for (let letter = 0; letter < channelLen; letter++) {
            result.push(channel.charCodeAt(letter));
        }
        result.push.apply(result, _uint16Size(packets.length));
        packets.forEach(packet => {
            if (packet['splice'] === undefined && !(packet instanceof Buffer)) {
                throw new Error(`
        Cannot send unexpected type ${packet.constructor['name']} \`${JSON.stringify(packet)}\`.
        Verify Serializer output or send data of type Buffer or UInt8Array
      `);
            }
            result.push.apply(result, _uint16Size(packet.length));
            result.push.apply(result, packet);
        });
        return result;
    }
    function _uint16Size(value) {
        return [value >>> 8, value & 0xff];
    }
    function _numericSize(bytes, index) {
        return (bytes[index] << 8) | bytes[index + 1];
    }
    function deserialize(payload) {
        const channelLength = payload[1];
        let caret = 4 + channelLength;
        const totalPackets = _numericSize(payload, 2 + channelLength);
        const result = {
            channel: String.fromCharCode.apply(null, payload.slice(2, 2 + channelLength)),
            frameId: payload[0],
            packets: _parseFramePacket(),
            payloadBytes: payload.length,
        };
        function _parseFramePacket() {
            const packets = [];
            for (let p = 0; p < totalPackets; p++) {
                if (caret >= payload.length)
                    continue;
                const packetLength = _numericSize(payload, caret);
                packets.push(payload.slice(2 + caret, 2 + packetLength + caret));
                caret = 2 + caret + packetLength;
            }
            return packets;
        }
        return result;
    }
    var parser = { serialize, deserialize };

    function Client(params, emitter, handle) {
        let connected = 1;
        const channels = {};
        const muWrap = handler => evt => handler(evt[0], evt[1]);
        const serializer = params.format(params, emitter);
        const socket = params.transport(params, emitter);
        emitter.setMaxListeners(Infinity);
        function write(channel, message) {
            emitter.emit('stats.packetWrite');
            return _resolveChannel(channel).queue.add(serializer.encode(message));
        }
        function destroy() {
            for (const channel in channels)
                channels[channel].queue.flush();
            if (connected > 1)
                setTimeout(() => socket.disconnect(handle), 0);
        }
        function subscribe(channel, handler) {
            _resolveChannel(channel).emitter.on('message', muWrap(handler));
        }
        function unsubscribe(channel, handler) {
            if (!(channel in channels))
                return;
            _resolveChannel(channel).emitter
                .off('message', muWrap(handler))
                .emit('unsubscribe');
            if (channels[channel].emitter.listenerCount('message') === 0) {
                channels[channel].queue.flush();
                delete channels[channel];
            }
        }
        function remote() {
            if (params.isServer)
                return socket.remote(handle);
            return {
                host: params.host,
                port: params.port,
            };
        }
        function local() {
            if (params.isServer) {
                return {
                    host: params.host,
                    port: params.port,
                };
            }
            return null;
        }
        function _createChannel(channel) {
            const channelEmitter = new events.EventEmitter();
            channelEmitter.setMaxListeners(Infinity);
            return {
                emitter: channelEmitter,
                queue: params.routine(channel, params, channelEmitter),
            };
        }
        function _wrap(event) {
            const payload = parser.serialize(event.frameId, event.channel, event.packets);
            emitter.emit('stats.packetReady');
            socket.send(handle, payload);
        }
        function _resolveChannel(channel) {
            if (!(channel in channels)) {
                channels[channel] = _createChannel(channel);
                channels[channel].emitter.on('runQueue', _wrap);
            }
            return channels[channel];
        }
        function _handleConnect() {
            connected = 2;
            logger.log(`log: connected to ${params.host}:${params.port}`);
        }
        function _handleError(err) {
            logger.log(`error: ${err.message}`);
        }
        function _handleRequest(payload) {
            emitter.emit('stats.packetReceived');
            const frame = parser.deserialize(payload);
            frame.packets.forEach((packet, i) => _handlePackets(frame, packet, i));
        }
        async function _handlePackets(frame, packet, index) {
            if (packet.length === 0)
                return;
            const decodedPacket = (params.format !== null) ? await serializer.decode(packet) : packet;
            emitter.emit('stats.packetDecoded');
            if (channels[frame.channel]) {
                channels[frame.channel].emitter.emit('message', [decodedPacket, {
                        client: params,
                        frame: {
                            channel: frame.channel,
                            id: frame.frameId,
                            messageIndex: index,
                            payloadBytes: frame.payloadBytes,
                            payloadMessages: frame.packets.length,
                        },
                    }]);
            }
        }
        function _handleDisconnect() {
            connected = 0;
            logger.log(`log: lost connection to ${params.host}:${params.port}`);
        }
        emitter.on('connect', _handleConnect);
        emitter.on('disconnect', _handleDisconnect);
        emitter.on('error', _handleError);
        emitter.on('frame', _handleRequest);
        if (!handle)
            logger.log(`log: connecting to ${params.host}:${params.port}`);
        handle = socket.connect(handle);
        return Object.assign(emitter, { write, destroy, subscribe, unsubscribe, remote, local, label: params.label });
    }

    function Provider(params, emitter, server) {
        const connections = [];
        const socket = params.transport(params, emitter);
        emitter.setMaxListeners(Infinity);
        function broadcast(channel, payload) {
            connections.forEach(c => c.write(channel, payload));
        }
        function stop() {
            logger.log('warn: stopping server');
            connections.forEach(connection => connection.destroy());
            connections.length = 0;
            socket.stop();
        }
        function _handleError(err) {
            logger.log(`error: ${err}`);
        }
        function handleConnection(handle) {
            const origin = socket.remote(handle);
            const client = Client(Object.assign({}, params, { host: origin.host, isServer: true, port: origin.port, provider: {
                    broadcast,
                    connections,
                    label: params.label,
                    server,
                    stop,
                } }), new events.EventEmitter(), handle);
            connections.push(client);
            emitter.emit('connection', client);
            logger.log(`log: connection from ${origin.host}:${origin.port}`);
        }
        emitter.on('socket', handleConnection);
        emitter.on('error', _handleError);
        logger.log(`log: listening on ${params.host}:${params.port}`);
        socket.bind();
        return Object.assign(emitter, { label: params.label, port: params.port, broadcast, stop, connections });
    }

    function json() {
        return function serializer(params, emitter) {
            async function encode(payload) {
                return Buffer.from(JSON.stringify(payload));
            }
            async function decode(payload) {
                return JSON.parse(payload.toString());
            }
            return { encode, decode };
        };
    }

    function ipc({ socketTimeout = 30000, path = '/tmp/app.socket-' } = {}) {
        return function socket(params, emitter) {
            let listener;
            function bind() {
                listener = net.createServer(soc => emitter.emit('socket', soc));
                listener.on('error', err => emitter.emit('error', err));
                listener.listen(path + params.port, () => emitter.emit('ready'));
            }
            function remote(handle) {
                return {
                    host: handle['_server']._pipeName,
                    port: handle['_handle'].fd,
                };
            }
            function connect(handle) {
                const connection = handle || net.connect(`${path}${params.port}`);
                connection.on('data', req => emitter.emit('frame', req));
                connection.on('error', err => emitter.emit('error', err));
                connection.on('connect', () => emitter.emit('connect', connection));
                connection.on('close', () => emitter.emit('disconnect'));
                connection.setTimeout(socketTimeout, () => emitter.emit('disconnect'));
                return connection;
            }
            function stop() {
                if (listener)
                    listener.close();
            }
            function send(handle, payload) {
                if (handle)
                    handle.write(Buffer.from(payload));
            }
            function disconnect(handle) {
                if (handle) {
                    handle.end();
                    handle.destroy();
                }
            }
            return {
                bind,
                connect,
                disconnect,
                remote,
                send,
                stop,
            };
        };
    }

    function tcp({ socketTimeout = 30000 } = {}) {
        return function socket(params, emitter) {
            let listener;
            function bind() {
                listener = net.createServer(soc => emitter.emit('socket', soc));
                listener.on('error', err => emitter.emit('error', err));
                listener.listen(params.port, () => emitter.emit('ready'));
            }
            function remote(handle) {
                return {
                    host: handle.remoteAddress,
                    port: handle.remotePort,
                };
            }
            function connect(handle) {
                const connection = handle || net.connect(params.port, params.host);
                connection.on('data', req => emitter.emit('frame', req));
                connection.on('error', err => emitter.emit('error', err));
                connection.on('connect', () => emitter.emit('connect', connection));
                connection.on('close', () => emitter.emit('disconnect'));
                connection.setTimeout(socketTimeout, () => emitter.emit('disconnect'));
                return connection;
            }
            function stop() {
                if (listener)
                    listener.close();
            }
            function send(handle, payload) {
                if (handle)
                    handle.write(Buffer.from(payload));
            }
            function disconnect(handle) {
                if (handle) {
                    handle.end();
                    handle.destroy();
                }
            }
            return {
                bind,
                connect,
                disconnect,
                remote,
                send,
                stop,
            };
        };
    }

    function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = true, socketTimeout = 30000, connectTimeout = 1000, } = {}) {
        return function socket(params, emitter) {
            let listener;
            const clientCache = {};
            function addClient(client) {
                const local = client.local();
                const key = `${local.host}.${local.port}`;
                if (local.host === params.host && local.port === params.port)
                    return;
                clientCache[key].client = client;
                clientCache[key].timeout = setTimeout(client.destroy, socketTimeout);
                for (let i = 0; i < clientCache[key].data.length; i++) {
                    clientCache[key].client.emit('frame', clientCache[key].data[i]);
                }
                clientCache[key].data.length = 0;
            }
            function resolveClient(origin, data) {
                const handle = {
                    host: origin.address,
                    port: origin.port,
                    socket: listener,
                };
                if (data[0] === 83 && data[1] === 89 && data[2] === 78) {
                    send(handle, Buffer.from('ACK'));
                    data = null;
                }
                const key = `${origin.address}.${origin.port}`;
                clearTimeout(clientCache[key] && clientCache[key].timeout);
                if (!clientCache[key]) {
                    clientCache[key] = {
                        client: null,
                        data: [],
                        timeout: null,
                    };
                    emitter.emit('socket', handle);
                }
                if (data) {
                    if (clientCache[key].client)
                        clientCache[key].client.emit('frame', data);
                    else
                        clientCache[key].data.push(data);
                }
            }
            function bind() {
                listener = dgram.createSocket({ type: type, reuseAddr });
                listener.on('message', (data, origin) => resolveClient(origin, data));
                listener.on('error', err => emitter.emit('error', err));
                listener.bind(params.port, localAddr);
                emitter.emit('ready');
            }
            function remote(handle) {
                return handle;
            }
            function send(handle, payload) {
                if (handle) {
                    handle.socket.send(Buffer.from(payload), handle.port, handle.host);
                }
            }
            function stop() {
                listener.close();
            }
            function connect(handle) {
                if (handle)
                    return handle;
                const connection = dgram.createSocket(type);
                let timeout;
                connection.on('error', err => emitter.emit('error', err));
                connection.on('message', req => {
                    if (req[0] === 65 && req[1] === 67 && req[2] === 75) {
                        clearTimeout(timeout);
                        emitter.emit('connect', connection);
                    }
                    else
                        emitter.emit('frame', req);
                });
                connection.bind(null, localAddr);
                const res = {
                    host: params.host,
                    port: params.port,
                    socket: connection,
                };
                send(res, Buffer.from('SYN'));
                timeout = setTimeout(() => disconnect(res), connectTimeout);
                return res;
            }
            function disconnect(handle) {
                if (handle)
                    handle = null;
                emitter.emit('disconnect');
            }
            emitter.on('connection', addClient);
            return {
                bind,
                connect,
                disconnect,
                remote,
                send,
                stop,
            };
        };
    }

    function dynamic(hz) {
        if (hz <= 0 || hz > 1000) {
            throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
        }
        return function queue(channel, params, emitter) {
            let timer = null;
            const packets = [];
            let i = 0;
            function add(packet) {
                emitter.emit('stats.queueAdd', { frameId: i, packet: packets.length });
                if (timer === null) {
                    timer = setTimeout(_step, Math.round(1000 / hz));
                }
                packet.then(p => packets.push(p));
            }
            function _step() {
                emitter.emit('stats.queueRun', { frameId: i, packets: packets.length });
                clearTimeout(timer);
                timer = null;
                emitter.emit('runQueue', { frameId: i++, channel, packets });
                if (i > 255)
                    i = 0;
                packets.length = 0;
            }
            function size() { return packets.length; }
            return { add, size, flush: _step };
        };
    }

    function realtime() {
        return function queue(channel, params, emitter) {
            let i = 0;
            function add(packet) {
                emitter.emit('stats.queueAdd', { frameId: i, packet: 0 });
                packet.then(p => {
                    emitter.emit('stats.queueRun', { frameId: i, packets: 1 });
                    emitter.emit('runQueue', { frameId: i++, channel, packets: [p] });
                    if (i > 255)
                        i = 0;
                });
            }
            function size() { return 0; }
            function flush() { }
            return { add, size, flush };
        };
    }

    function tick(hz, seed = Date.now()) {
        if (hz <= 0 || hz > 1000) {
            throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
        }
        let i = 0;
        function _delta() {
            const now = Date.now() - seed;
            i = (now / (1000 / hz)) % 255;
            return Math.round(now % (1000 / hz));
        }
        return function queue(channel, params, emitter) {
            let timer = null;
            const packets = [];
            function add(packet) {
                emitter.emit('stats.queueAdd', { frameId: i, packet: packets.length });
                if (timer === null) {
                    timer = setTimeout(_step, _delta());
                }
                packet.then(p => packets.push(p));
            }
            function _step() {
                emitter.emit('stats.queueRun', { frameId: i, packets: packets.length });
                clearTimeout(timer);
                timer = null;
                emitter.emit('runQueue', { frameId: i, channel, packets });
                packets.length = 0;
            }
            function size() { return packets.length; }
            return { add, size, flush: _step };
        };
    }

    const defaults = {
        format: json(),
        host: '0.0.0.0',
        port: 3000,
        routine: realtime(),
        transport: tcp({ socketTimeout: 30000 }),
    };
    function listen(options) {
        const server = {
            host: options.host || defaults.host,
            providers: null,
        };
        server.providers = options.providers.map(config => {
            return Provider(Object.assign({}, defaults, config), new events.EventEmitter(), server);
        });
        return server;
    }
    function connect(options) {
        return Client(Object.assign({}, defaults, options), new events.EventEmitter());
    }
    var index = {
        connect,
        formats: {
            json,
        },
        listen,
        routines: {
            dynamic,
            realtime,
            tick,
        },
        transports: {
            ipc,
            tcp,
            udp,
        },
    };

    return index;

})));
