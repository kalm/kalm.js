/** 
 * Sessions
 * @namespace {object} Internal/Sessions
 */

'use strict';

/* Local variables -----------------------------------------------------------*/

// In-memory sessions
const sessions = {};

/* Methods -------------------------------------------------------------------*/

/**
 * Creates/retreives the session associated with the client uuid in memory
 * @memberof Internal/Sessions
 * @param {String} id The id of the session to create/fetch
 * @returns {object} The session bucket
 */
function resolve(id) {
  sessions[id] = sessions[id] || {};
  return sessions[id];
}

/**
 * Destroys the selected session from memory
 * @memberof Internal/Sessions
 * @param {String} id The id of the session to delete
 */
function cleanup(id) {
  delete sessions[id];
}

/* Exports -------------------------------------------------------------------*/

module.exports = { resolve, cleanup };