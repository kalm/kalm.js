/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import client from './components/client';
import provider from './components/provider';

import dynamic from './routines/dynamic';
import realtime from './routines/realtime';
import tick from './routines/tick';

/* Local variables -----------------------------------------------------------*/

const defaults = {
  host: '0.0.0.0',
  json: true,
  port: 3000,
  routine: realtime(),
  transport: null,
};

/* Methods -------------------------------------------------------------------*/

const uniqueLabel = () => Math.random().toString(36).substring(7);

function listen(options: ProviderConfig): Provider {
  return provider({ label: uniqueLabel(), ...defaults, ...options }, new EventEmitter());
}

function connect(options: ClientConfig): Client {
  return client({ label: uniqueLabel(), ...defaults, ...options }, new EventEmitter());
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
