/* Requires ------------------------------------------------------------------*/

import Client from './components/client';
import Provider from './components/provider';

import json from './formats/json';

import ipc from './transports/ipc';
import tcp from './transports/tcp';
import udp from './transports/udp';

import dynamic from './routines/dynamic';
import realtime from './routines/realtime';
import tick from './routines/tick';
import { EventEmitter } from 'events';

import { Server, ClientConfig, ServerConfig, Provider as ProviderType } from './types';

/* Local variables -----------------------------------------------------------*/

const defaults = {
  format: json(),
  host: '0.0.0.0',
  port: 3000,
  routine: realtime(),
  secretKey: null,
  transport: tcp({ socketTimeout: 30000 }),
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
  formats: {
    json,
  },
  listen,
  routines: {
    dynamic,
    realtime,
    tick,
  },
  transports: {
    ipc,
    tcp,
    udp,
  },
};
