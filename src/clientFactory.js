/** Client Factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;

const defaults = require('./defaults');
const Queue = require('./components/queue');
const Multiplex = require('./components/multiplex');
const Client = require('./components/client');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const client = { hostname: '0.0.0.0' };

  Object.assign(client,
    defaults,
    options,
    Multiplex(client),
    Queue(client),
    Client(client),
    EventEmitter.prototype
  );

  return client.init();
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };