/* Requires ------------------------------------------------------------------*/

import client from './components/client';
import provider from './components/provider';

import dynamic from './routines/dynamic';
import realtime from './routines/realtime';
import tick from './routines/tick';
import { EventEmitter } from 'events';

import { ProviderConfig, Provider, ClientConfig, Client } from '../../../types';

/* Local variables -----------------------------------------------------------*/

const defaults = {
  host: '0.0.0.0',
  json: true,
  port: 3000,
  routine: realtime(),
  transport: null,
};

/* Methods -------------------------------------------------------------------*/

function listen(options: ProviderConfig): Provider {
  options.label = options.label || Math.random().toString(36).substring(7);
  return provider({ ...defaults, ...options }, new EventEmitter());
}

function connect(options: ClientConfig): Client {
  options.label = options.label || Math.random().toString(36).substring(7);
  return client({ ...defaults, ...options }, new EventEmitter());
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
