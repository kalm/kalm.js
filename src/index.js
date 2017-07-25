/**
 * @namespace {object} Kalm
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const clientFactory = require('./clientFactory');
const serverFactory = require('./serverFactory');
const profiles = require('./profiles');
const serials = require('./serials');
const transports = require('./transports');

/* Methods -------------------------------------------------------------------*/

/**
 * Kalm.listen
 * @memberof Kalm
 * @param {object} options The options for the Kalm Server
 * @returns {object} A new Kalm Server
 */
function listen(options) {
  return serverFactory.create(options);
}

/**
 * Kalm.connect
 * @memberof Kalm
 * @param {object} options The options for the Kalm Client
 * @returns {object} A new Kalm Client
 */
function connect(options) {
  return clientFactory.create(options);
}


/* Exports -------------------------------------------------------------------*/

module.exports = { listen, connect, serials, transports, profiles };