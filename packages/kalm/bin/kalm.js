(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('events')) :
    typeof define === 'function' && define.amd ? define(['events'], factory) :
    (global.kalm = factory(global.events));
}(this, (function (events) { 'use strict';

    const enabled = ((typeof process === 'object' && (process.env.NODE_DEBUG || '').indexOf('kalm') > -1) ||
        (typeof window === 'object' && (window['DEBUG'] || '').indexOf('kalm') > -1));
    function log(msg) {
        if (enabled)
            console.log(msg);
    }
    var logger = { log };

    function serialize(frameId, channel, packets) {
        const channelLen = channel.length;
        const result = [frameId % 255, channelLen];
        for (let letter = 0; letter < channelLen; letter++) {
            result.push(channel.charCodeAt(letter));
        }
        result.push.apply(result, _uint16Size(packets.length));
        packets.forEach((packet) => {
            if (!(packet instanceof Buffer)) {
                throw new Error(`
        Cannot send packet \`${JSON.stringify(packet)}\`.
        Verify Serializer output or send data of type Buffer
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
        const socket = params.transport(params, emitter);
        emitter.setMaxListeners(50);
        function write(channel, message) {
            emitter.emit('stats.packetWrite');
            return _resolveChannel(channel)
                .queue.add(params.json === true ? Buffer.from(JSON.stringify(message)) : message);
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
        function _handlePackets(frame, packet, index) {
            if (packet.length === 0)
                return;
            const decodedPacket = (params.json === true) ? JSON.parse(packet.toString()) : packet;
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
                packets.push(packet);
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
                emitter.emit('stats.queueRun', { frameId: i, packets: 1 });
                emitter.emit('runQueue', { frameId: i++, channel, packets: [packet] });
                if (i > 255)
                    i = 0;
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
                packets.push(packet);
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
        host: '0.0.0.0',
        json: true,
        port: 3000,
        routine: realtime(),
        transport: null,
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
    var kalm = {
        connect,
        listen,
        routines: {
            dynamic,
            realtime,
            tick,
        },
    };

    return kalm;

})));
