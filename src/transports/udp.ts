/* Requires ------------------------------------------------------------------*/

import dgram from 'dgram';
import { Socket, Transport, ByteList, ClientConfig, Remote } from '../types';
import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

function udp({ type = 'udp4', localAddr = '0.0.0.0', reuseAddr = true, socketTimeout = 30000 } = {}): Transport {
  return function socket(params: ClientConfig, emitter: EventEmitter): Socket {
    let listener: dgram.Socket;
    const clientCache = {};

    function addClient(client) {
      const local: Remote = client.local();
      const key: string = `${local.host}.${local.port}`;

      // Client connection - skip
      if (local.host === params.host && local.port === params.port) return;

      clientCache[key].client = client;
      clientCache[key].timeout = setTimeout(client.destroy, socketTimeout);

      for (let i = 0; i < clientCache[key].data.length; i++) {
        clientCache[key].client.emit('frame', clientCache[key].data[i]);
      }
      clientCache[key].data.length = 0;
    }

    function resolveClient(origin, data) {
      const key = `${origin.address}.${origin.port}`;
      clearTimeout(clientCache[key] && clientCache[key].timeout);

      if (!clientCache[key]) {
        emitter.emit('socket', {
          _host: params.host,
          _port: params.port,
          host: origin.address,
          port: origin.port,
        });
        clientCache[key] = {
          client: null,
          data,
          timeout: null,
        };
      } else {
        if (!clientCache[key].client) {
          clientCache[key].push(data);
        } else {
          clientCache[key].client.emit('frame', data);
        }
      }
    }

    function bind(): void {
      listener = dgram.createSocket({ type: type as dgram.SocketType, reuseAddr });
      listener.on('message', (data, origin) => resolveClient(origin, data));
      listener.on('error', err => emitter.emit('error', err));
      listener.bind(params.port, localAddr);
    }

    function remote(handle: dgram.Socket): Remote {
      return {
        host: handle['_host'],
        port: handle['_port'],
      };
    }

    function send(handle: dgram.Socket, payload: ByteList): void {
      handle.send(payload, handle['_port'], handle['_host']);
    }

    function stop(): void {
      listener.close();
    }

    function connect(): dgram.Socket {
      const connection = dgram.createSocket(type as dgram.SocketType);
      connection['_port'] = params.port;
      connection['_host'] = params.host;
      connection.on('error', err => emitter.emit('error', err));
      connection.on('message', req => emitter.emit('frame', req));
      socket.bind(null, localAddr);
      emitter.emit('connect', connection);
      return connection;
    }

    function disconnect(): void {
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

/* Exports -------------------------------------------------------------------*/

export = udp;
