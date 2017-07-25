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
  const chars = [];
  for (let i = 0; i < str.length; i++) {
    chars.push(str.charCodeAt(i));
  }

  return chars;
}

/* Exports -------------------------------------------------------------------*/

module.exports = { encode, decode };