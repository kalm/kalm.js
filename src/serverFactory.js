/** Server factory */

'use strict';

/* Requires ------------------------------------------------------------------*/

const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');

const profiles = require('./profiles');
const serials = require('./serials');
const transports = require('./transports');

const Server = require('./components/server');

/* Methods -------------------------------------------------------------------*/

function create(options) {
  const server = {
    id: crypto.randomBytes(8).toString('hex'),
    port: 3000,
    profile: profiles.dynamic,
    serial: serials.JSON,
    secretKey: null,
    transport: transports.TCP,
  };

  Object.assign(server,
    options,
    Server(server),
    EventEmitter.prototype
  );

  return server;
}


/* Exports -------------------------------------------------------------------*/

module.exports = { create };