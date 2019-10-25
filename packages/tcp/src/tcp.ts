/* Requires ------------------------------------------------------------------*/

import net from 'net';

/* Methods -------------------------------------------------------------------*/

export function tcp({ socketTimeout = 30000 }: TCPConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: net.Server;

    function bind(): void {
      listener = net.createServer(soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      listener.listen(params.port, () => emitter.emit('ready'));
    }

    function remote(handle: net.Socket): Remote {
      return {
        host: handle.remoteAddress,
        port: handle.remotePort,
      };
    }

    function disconnect(handle: net.Socket): void {
      if (handle) {
        handle.end();
        handle.destroy();
      }
    }

    function connect(handle: net.Socket): net.Socket {
      const connection: net.Socket = handle || net.connect(params.port, params.host);
      connection.on('data', req => emitter.emit('rawFrame', req));
      connection.on('error', err => emitter.emit('error', err));
      connection.on('connect', () => emitter.emit('connect', connection));
      connection.on('close', () => emitter.emit('disconnect'));
      connection.setTimeout(socketTimeout, () => disconnect(handle));
      return connection;
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function send(handle: net.Socket, payload: number[]): void {
      if (handle) handle.write(Buffer.from(payload));
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

/* Exports -------------------------------------------------------------------*/

module.exports = tcp;
