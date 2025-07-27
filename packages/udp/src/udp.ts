import dgram from 'dgram';

type UDPSocketHandle = {
  socket: dgram.Socket
  port: number
  host: string
};

type UDPConfig = {
  type?: dgram.SocketType
  localAddr?: string
  reuseAddr?: boolean
  socketTimeout?: number
};

function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = false, socketTimeout = 30000 }: UDPConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: dgram.Socket;
    const clientCache = {};

    function addClient(client: Client): void {
      const local: Remote = client.local;
      const key = `${local.host}.${local.port}`;

      // Client connection - skip
      if (local.host === params.host && local.port === params.port) return;
      clientCache[key].client = client;

      for (let i = 0; i < clientCache[key].data.length; i++) {
        clientCache[key].client.emit('frame', JSON.parse(clientCache[key].data[i].toString()), clientCache[key].data[i].length);
      }
      clientCache[key].data.length = 0;
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
      resetTimeout(handle);
    }

    function stop(): void {
      listener.close();
      listener = null;
    }

    function disconnect(handle?: UDPSocketHandle): void {
      if (handle && handle.socket) handle.socket = null;
      emitter.emit('disconnect');
    }

    function connect(handle?: UDPSocketHandle): UDPSocketHandle {
      if (handle) return handle;
      const connection = dgram.createSocket(type as dgram.SocketType);

      connection.on('error', err => emitter.emit('error', err));
      connection.on('message', (req) => {
        emitter.emit('connect', connection);
        emitter.emit('frame', JSON.parse(req.toString()), req.length);
        resetTimeout(res);
      });
      connection.bind(null, localAddr);

      const res = {
        host: params.host,
        port: params.port,
        socket: connection,
        _timer: null,
      };

      resetTimeout(res);

      return res;
    }

    function resolveClient(origin, data) {
      const handle: UDPSocketHandle = {
        host: origin.address,
        port: origin.port,
        socket: listener,
      };

      const key = `${origin.address}.${origin.port}`;

      if (!clientCache[key]) {
        clientCache[key] = {
          client: null,
          data: [],
        };
        emitter.emit('socket', handle);
      }

      if (data) {
        if (clientCache[key].client) clientCache[key].client.emit('frame', JSON.parse(data.toString()));
        else clientCache[key].data.push(data);
      }
    }

    function resetTimeout(handle) {
      clearTimeout(handle._timer);
      handle._timer = setTimeout(() => {
        disconnect(handle);
      }, socketTimeout);
    }

    function bind(): void {
      listener = dgram.createSocket({ type: type as dgram.SocketType, reuseAddr });
      listener.on('message', (data, origin) => resolveClient(origin, data));
      listener.on('error', err => emitter.emit('error', err));
      listener.bind(params.port, localAddr);
      setTimeout(() => emitter.emit('ready'), 1);
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

// Ensures support for modules and requires
module.exports = udp;
