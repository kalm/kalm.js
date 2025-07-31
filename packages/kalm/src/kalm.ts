import { Client } from './components/client';
import { Server } from './components/server';

import { dynamic } from './routines/dynamic';
import { realtime } from './routines/realtime';
import { tick } from './routines/tick';

import { EventEmitter } from './utils/events';

const defaults: ServerConfig = {
  host: '0.0.0.0',
  json: true,
  port: 3000,
  routine: realtime(),
  transport: null,
};

const uniqueLabel = () => Math.random().toString(36).substring(7);

function validateOptions(options: ServerConfig): void {
  if (options.transport === null || options.transport === undefined) {
    throw new Error(`Unable to create Kalm client, missing "transport" parameter.
      You may need to install one. ex: @kalm/tcp`);
  }

  if (typeof options.transport !== 'function') {
    throw new Error(`Transport is not a function (${options.transport}), see: https://github.com/kalm/kalm.js#documentation`);
  }

  if (!options.transport({}, {}).bind) {
    throw new Error('Transport is not valid, it may not have been invoked, see: https://github.com/kalm/kalm.js#documentation');
  }

  if (options.port && !isNaN(options.port)) options.port = +options.port;

  if (options.routine) {
    if (typeof options.transport !== 'function') {
      throw new Error(`Routine is not a function (${options.routine}), see: https://github.com/kalm/kalm.js#documentation`);
    }
    const testChannel = options.routine({}, () => 0);
    if (!testChannel.add) {
      throw new Error('Routine is not valid, it may not have been invoked, see: https://github.com/kalm/kalm.js#documentation');
    }
  }
}

export function listen(options: ServerConfig): Server {
  validateOptions(options);
  return Server({ label: uniqueLabel(), ...defaults, ...options }, new EventEmitter());
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
