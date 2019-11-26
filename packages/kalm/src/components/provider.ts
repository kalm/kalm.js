/* Requires ------------------------------------------------------------------*/

import EventEmitter from '../utils/emitter';
import { log } from '../utils/logger';
import { Client } from './client';

/* Methods -------------------------------------------------------------------*/

export function Provider(params: ClientConfig, emitter: EventEmitter): Provider {
  const connections = [];
  const socket: Socket = params.transport(params, emitter);

  function broadcast(channel: string, payload: Serializable): void {
    connections.forEach(c => c.write(channel, payload));
  }

  function stop(): void {
    log('stopping server');

    connections.forEach(connection => connection.destroy());
    connections.length = 0;
    socket.stop();
  }

  function _handleError(err) {
    log(`error ${err}`);
  }

  function handleConnection(handle) {
    const origin: Remote = socket.remote(handle);

    const client = Client({
      ...params,
      host: origin.host,
      isServer: true,
      port: origin.port,
      provider: {
        broadcast,
        connections,
        label: params.label,
        stop,
      },
    }, EventEmitter(), handle);

    connections.push(client);
    emitter.emit('connection', client);
    log(`connection from ${origin.host}:${origin.port}`);
  }

  emitter.on('socket', handleConnection);
  emitter.on('error', _handleError);
  log(`listening on ${params.host}:${params.port}`);
  socket.bind();

  return Object.assign(emitter, {
    label: params.label,
    port: params.port,
    broadcast,
    stop,
    connections,
  });
}
