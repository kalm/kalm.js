/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { Client } from './components/client';
import { Provider } from './components/provider';

import { dynamic } from './routines/dynamic';
import { realtime } from './routines/realtime';
import { tick } from './routines/tick';

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

function validateOptions(options: ProviderConfig): void {
  if (options.transport === null || options.transport === undefined) {
    throw new Error(`Unable to create Kalm client, missing "transport" parameter.
      You may need to install one. ex: @kalm/tcp`);
  }
}

export function listen(options: ProviderConfig): Provider {
  validateOptions(options);
  return Provider({ label: uniqueLabel(), ...defaults, ...options }, new EventEmitter());
}

export function connect(options: ClientConfig): Client {
  validateOptions(options);
  return Client({ label: uniqueLabel(), ...defaults, ...options }, new EventEmitter());
}

export const routines = {
  dynamic,
  realtime,
  tick,
};
