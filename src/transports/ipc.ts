/* Requires ------------------------------------------------------------------*/

import net from 'net';
import { Socket, Transport, ByteList, ClientConfig, Remote } from '../types';
import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

function ipc({ socketTimeout = 30000, path = '/tmp/app.socket-' } = {}): Transport {
  return function socket(params: ClientConfig, emitter: EventEmitter): Socket {
    let listener: net.Server;

    function bind(): void {
      listener = net.createServer(soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      listener.listen(path + params.port, () => emitter.emit('ready'));
    }

    function remote(handle: net.Socket): Remote {
      return {
        host: handle['_server']._pipeName,
        port: handle['_handle'].fd,
      };
    }

    function connect(handle: net.Socket): net.Socket {
      const connection: net.Socket = handle || net.connect(`${path}${params.port}`);
      connection.on('data', req => emitter.emit('frame', [...req]));
      connection.on('error', err => emitter.emit('error', err));
      connection.on('connect', () => emitter.emit('connect', connection));
      connection.on('close', () => emitter.emit('disconnect'));
      connection.setTimeout(socketTimeout, () => emitter.emit('disconnect'));
      return connection;
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function send(handle: net.Socket, payload: ByteList): void {
      if (handle) handle.write(Buffer.from(payload as number[]));
    }

    function disconnect(handle): void {
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

/* Exports -------------------------------------------------------------------*/

export default ipc;
