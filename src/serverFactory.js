/* Server factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');

const defaults = require('./defaults');
const Server = require('./components/server');
const clientFactory = require('./clientFactory');
const validation = require('./utils/validation');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const server = { id: crypto.randomBytes(8).toString('hex') };

  validation.validateOptions(options);

  Object.assign(server,
    defaults,
    Server(server, crypto, clientFactory),
    EventEmitter.prototype,
    options
  );

  return server.init();
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };