/** Server factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');

const defaults = require('./defaults');
const Server = require('./components/server');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const server = { id: crypto.randomBytes(8).toString('hex') };

  Object.assign(server,
    defaults,
    options,
    Server(server),
    EventEmitter.prototype
  );

  return server.init();
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };