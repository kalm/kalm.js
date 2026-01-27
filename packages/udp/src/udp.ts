import dgram from 'dgram';

type UDPSocketHandle = {
  socket: dgram.Socket
  port: number
  host: string
  _timer?: number
  _isActive?: boolean
};

type UDPConfig = {
  type?: dgram.SocketType
  localAddr?: string
  reuseAddr?: boolean
  socketTimeout?: number
};

export default function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = false, socketTimeout = 30000 }: UDPConfig = {}): KalmTransport {
  if (typeof window !== 'undefined') throw new Error('Cannot use UDP from the browser');

  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: dgram.Socket;
    const clientCache = {};

    // Appends client instance and message queue
    function addClient(client: Client): void {
      const local: Remote = client.local;
      const key = `${local.host}:${local.port}`;

      // Client connection - skip
      if (local.host === params.host && local.port === params.port) return;
      clientCache[key].client = client;

      setImmediate(() => emitFrames(key));
    }

    function emitFrames(key) {
      if (clientCache[key].client) {
        for (let i = 0; i < clientCache[key].data.length; i++) {
          clientCache[key].client.emit('frame', { body: JSON.parse(clientCache[key].data[i].toString()), payloadBytes: clientCache[key].data[i].length });
        }
        clientCache[key].data.length = 0;
      }
    }

    function remote(handle: UDPSocketHandle): Remote {
      return {
        host: handle?.host || null,
        port: handle?.port || null,
      };
    }

    function send(handle: UDPSocketHandle, payload: RawFrame | string): void {
      const payloadBytes = JSON.stringify(payload);
      if (Buffer.byteLength(payloadBytes, 'utf-8') >= 16384) {
        emitter.emit('error', new Error(`UDP Cannot send packets larger than 16384 bytes, tried to send ${Buffer.byteLength(payloadBytes, 'utf-8')} bytes`));
        return;
      }
      if (handle && handle.socket) {
        handle.socket.send(payloadBytes, handle.port, handle.host);
      }
      handle._isActive = true;
    }

    function stop(): void {
      listener.close();
      listener = null;
    }

    function disconnect(handle?: UDPSocketHandle): void {
      if (handle && handle._timer) clearInterval(handle._timer);
      if (handle && handle.socket) handle.socket = null;
      setImmediate(() => emitter.emit('disconnected'));
    }

    function connect(handle?: UDPSocketHandle): UDPSocketHandle {
      if (handle) return handle;
      const connection = dgram.createSocket(type as dgram.SocketType) as dgram.Socket & { _parent: UDPSocketHandle };

      connection.on('error', err => emitter.emit('error', err));
      connection.on('message', (req) => {
        emitter.emit('frame', { body: JSON.parse(req.toString()), payloadBytes: req.length });
        connection._parent._isActive = true;
      });
      connection.bind(null, localAddr);

      const res = {
        host: params.host,
        port: params.port,
        socket: connection,
        _timer: null,
        _isActive: false,
      };

      res.socket._parent = res;

      setImmediate(() => emitter.emit('connect'));

      res._timer = setInterval(() => checkTimeout(res), socketTimeout);

      return res;
    }

    function resolveClient(origin, data) {
      const handle: UDPSocketHandle = {
        host: origin.address,
        port: origin.port,
        socket: listener,
      };

      const key = `${origin.address}:${origin.port}`;

      if (!clientCache[key]) {
        clientCache[key] = {
          client: null,
          data: [],
        };
        emitter.emit('socket', handle);
      }

      if (data) {
        clientCache[key].data.push(data);
        setImmediate(() => emitFrames(key));
      }
    }

    function checkTimeout(handle: UDPSocketHandle) {
      if (!handle._isActive) {
        disconnect(handle);
      }
      else {
        handle._isActive = false;
      }
    }

    function bind(): void {
      listener = dgram.createSocket({ type: type as dgram.SocketType, reuseAddr });
      listener.on('message', (data, origin) => resolveClient(origin, data));
      listener.on('error', err => emitter.emit('error', err));
      listener.bind(params.port, localAddr);
      setImmediate(() => emitter.emit('ready'));
    }

    if (emitter && typeof emitter.on === 'function') emitter.on('connection', addClient);

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
