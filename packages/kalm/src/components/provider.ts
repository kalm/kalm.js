/* Requires ------------------------------------------------------------------*/

import logger from '../utils/logger';
import Client from './client';
import { EventEmitter } from 'events';
import { Serializable, ClientConfig, Socket, Remote, Server, Provider } from '../../../../types';

/* Methods -------------------------------------------------------------------*/

function Provider(params: ClientConfig, emitter: EventEmitter, server: Server): Provider {
  const connections = [];
  const socket: Socket = params.transport(params, emitter);

  function broadcast(channel: string, payload: Serializable): void {
    connections.forEach(c => c.write(channel, payload));
  }

  function stop(): void {
    logger.log('warn: stopping server');

    connections.forEach(connection => connection.destroy());
    connections.length = 0;
    socket.stop();
  }

  function _handleError(err) {
    logger.log(`error: ${err}`);
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
        server,
        stop,
      },
    }, new EventEmitter(), handle);

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

/* Exports -------------------------------------------------------------------*/

export default Provider;
