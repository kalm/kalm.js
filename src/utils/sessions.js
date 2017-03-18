/** Sessions */

'use strict';

/* Local variables -----------------------------------------------------------*/

// In-memory sessions
const sessions = {};

/* Methods -------------------------------------------------------------------*/

/**
 * @param {String} id The id of the session to create/fetch
 * @returns {object} The session bucket
 */
function resolve(id) {
  if (!sessions.hasOwnProperty(id)) {
    sessions[id] = { data: {} }
  }
  sessions[id].lastUpdated = Date.now();
  return sessions[id].data;
}

/**
 * @param {String} id The id of the session to delete
 */
function cleanup(id) {
  delete sessions[id];
}

/* Exports -------------------------------------------------------------------*/

module.exports = { resolve, cleanup };