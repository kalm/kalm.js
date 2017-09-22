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
  return (Buffer.isBuffer(payload)) ? payload : toUInt8Array(JSON.stringify(payload));
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

/** @private */
function toUInt8Array(str) {
  const chars = [0];
  const len = str.length;
  for (let i = 0; i < len; i++) {
    chars[i] = str.charCodeAt(i)|0;
  }

  return chars;
}

/* Exports -------------------------------------------------------------------*/

module.exports = { encode, decode };