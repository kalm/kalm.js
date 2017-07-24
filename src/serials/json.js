/**
 * JSON Encoder
 * @category serials
 * @namespace {object} serials/JSON
 */

'use strict';

/* Methods -------------------------------------------------------------------*/

/**
 * Serializes a message
 * @memberof serials/JSON
 * @param {object} payload The payload to encode
 * @returns {Buffer} The encoded payload
 */
function encode(payload) {
  return (Buffer.isBuffer(payload)) ? payload : new Buffer(JSON.stringify(payload));
}

/**
 * Deserializes a message
 * @memberof serials/JSON
 * @param {Buffer} payload The payload to decode
 * @returns {object} The decoded payload
 */
function decode(payload) {
  return JSON.parse(String.fromCharCode.apply(null, payload));
}

/* Exports -------------------------------------------------------------------*/

module.exports = { encode, decode };