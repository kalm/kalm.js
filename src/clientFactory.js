/** Client Factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;

const defaults = require('./defaults');
const QueueList = require('./components/queueList');
const Multiplex = require('./components/multiplex');
const Client = require('./components/client');
const serializer = require('./utils/serializer');
const sessions = require('./utils/sessions');
const encrypter = require('./utils/encrypter');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const client = { hostname: '0.0.0.0' };
  const multiplex = Multiplex(client);
  const queueList = QueueList(client);

  Object.assign(client,
    defaults,
    multiplex,
    queueList,
    Client(client, queueList, multiplex, serializer, sessions, encrypter),
    EventEmitter.prototype,
    options
  );

  return client.init();
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };