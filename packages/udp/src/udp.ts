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

export default function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = false, socketTimeout = 30000 }: UDPConfig = {}): KalmTransport {
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

      setTimeout(() => emitFrames(key), 1);
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
        // We're leaving performance on the table, but sometimes the state of the drgam socket changes mid-flight...
        try {
          handle.socket.send(payloadBytes, handle.port, handle.host);
        }
        catch (e) {
          emitter.emit('error', e);
        }
      }
      resetTimeout(handle);
    }

    function stop(): void {
      listener.close();
      listener = null;
    }

    function disconnect(handle?: UDPSocketHandle): void {
      if (handle && handle.socket) handle.socket = null;
      setTimeout(() => emitter.emit('disconnected'), 1);
    }

    function connect(handle?: UDPSocketHandle): UDPSocketHandle {
      if (handle) return handle;
      const connection = dgram.createSocket(type as dgram.SocketType);

      connection.on('error', err => emitter.emit('error', err));
      connection.on('message', (req) => {
        emitter.emit('frame', { body: JSON.parse(req.toString()), payloadBytes: req.length });
        resetTimeout(res);
      });
      connection.bind(null, localAddr);

      const res = {
        host: params.host,
        port: params.port,
        socket: connection,
        _timer: null,
      };

      setTimeout(() => emitter.emit('connect'), 1);

      resetTimeout(res);

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
        setTimeout(() => emitFrames(key), 1);
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
