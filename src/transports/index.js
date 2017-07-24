/**
 * Kalm.transports
 * @memberof Kalm
 * @name transports
 * @example ['IPC', 'TCP', 'UDP']
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const IPC = require('./ipc');
const TCP = require('./tcp');
const UDP = require('./udp');

/* Exports -------------------------------------------------------------------*/

module.exports = { IPC, TCP, UDP };