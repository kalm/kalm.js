/* Requires ------------------------------------------------------------------*/

import dgram from 'dgram';

/* Methods -------------------------------------------------------------------*/

function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = false, socketTimeout = 30000, connectTimeout = 1000,
}: UDPConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: dgram.Socket;
    const clientCache: UDPClientList = {};

    function addClient(client: Client): void {
      const local: Remote = client.local;
      const key: string = `${local.host}.${local.port}`;

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
        port: handle?.port || null
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
    }

    function stop(): void {
      listener.close();
      listener = null;
    }

    function disconnect(handle?: UDPSocketHandle): void {
      if (handle && handle.socket) handle.socket = null;
      emitter.emit('disconnect');
    }

    function connect(handle?: SocketHandle): SocketHandle {
      if (handle) return handle;
      const connection = dgram.createSocket(type as dgram.SocketType);
      
      connection.on('error', err => emitter.emit('error', err));
      connection.on('message', req => {
        emitter.emit('connect', connection);
        emitter.emit('frame', JSON.parse(req.toString()), req.length);
      });
      connection.bind(null, localAddr);

      const res = {
        host: params.host,
        port: params.port,
        socket: connection,
      };

      return res;
    }

    function resolveClient(origin, data) {
      const handle: UDPSocketHandle = {
        host: origin.address,
        port: origin.port,
        socket: listener,
      };
      
      const key: string = `${origin.address}.${origin.port}`;

      if (!clientCache[key]) {
        clientCache[key] = {
          client: null,
          data: [],
        } as UDPClient;
        emitter.emit('socket', handle);
      }

      if (data) {
        if (clientCache[key].client) clientCache[key].client.emit('frame', JSON.parse(data.toString()));
        else clientCache[key].data.push(data);
      }
    }

    function bind(): void {
      listener = dgram.createSocket({ type: type as dgram.SocketType, reuseAddr });
      listener.on('message', (data, origin) => resolveClient(origin, data));
      listener.on('error', err => emitter.emit('error', err));
      listener.bind(params.port, localAddr);
      emitter.emit('ready');
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

/* Exports -------------------------------------------------------------------*/

module.exports = udp;
