/** Client Factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;

const defaults = require('./defaults');
const Queue = require('./components/queue');
const Multiplex = require('./components/multiplex');
const Client = require('./components/client');
const serializer = require('./utils/serializer');
const sessions = require('./utils/sessions');
const encrypter = require('./utils/encrypter');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const client = { hostname: '0.0.0.0' };
  const multiplex = Multiplex(client);
  const queue = Queue(client);

  Object.assign(client,
    defaults,
    multiplex,
    queue,
    Client(client, queue, multiplex, serializer, sessions, encrypter),
    EventEmitter.prototype,
    options
  );

  return client.init();
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };