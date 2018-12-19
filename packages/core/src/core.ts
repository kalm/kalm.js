/* Requires ------------------------------------------------------------------*/

import Client from './components/client';
import Provider from './components/provider';

import dynamic from './routines/dynamic';
import realtime from './routines/realtime';
import tick from './routines/tick';
import { EventEmitter } from 'events';

import { Server, ClientConfig, ServerConfig } from '../../../types';

/* Local variables -----------------------------------------------------------*/

const defaults = {
  json: true,
  host: '0.0.0.0',
  port: 3000,
  routine: realtime(),
  transport: null,
};

/* Methods -------------------------------------------------------------------*/

function listen(options: ServerConfig): Server {
  const server: Server = {
    host: options.host || defaults.host,
    providers: null,
  };
  server.providers = options.providers.map(config => {
    return Provider({ ...defaults, ...config }, new EventEmitter(), server);
  });
  return server;
}

function connect(options: ClientConfig) {
  return Client({ ...defaults, ...options }, new EventEmitter());
}

/* Exports -------------------------------------------------------------------*/

export default {
  connect,
  listen,
  routines: {
    dynamic,
    realtime,
    tick,
  },
};
