/* Kalm.defaults */

'use strict';

/* Requires ------------------------------------------------------------------*/

const profiles = require('./profiles');
const serials = require('./serials');
const transports = require('./transports');

/* Local variables -----------------------------------------------------------*/

/**
 * Default Client/Server configs
 * These values can be passed as an object parameter to both 'listen' and 
 * 'connect' methods.
 * 
 * 'secretKey' can be populated with a 16+ character string to be used for password-encryption of the messages.
 * This is no replacement to proper encryption, but provides sufficient hashing at a decent enough speed for non-critical scenarios
 * 
 * @memberof Kalm
 * @name defaults
 * @example { 
 *   hostname: '0.0.0.0',
 *   port: 3000,
 *   transport: Kalm.transports.TCP,
 *   serial: Kalm.serials.JSON,
 *   secretKey: null,
 *   profile: Kalm.profiles.dynamic
 * }
 */
const defaults = {
  //hostname: '0.0.0.0',
  //port: 3000,
  //transport: transports.TCP,
  serial: serials.JSON,
  secretKey: null,
  profile: profiles.dynamic,
  socketTimeout: 300000
};

/* Exports -------------------------------------------------------------------*/

module.exports = defaults;