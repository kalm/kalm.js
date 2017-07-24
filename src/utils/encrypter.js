/** 
 * Password encryption
 * @namespace {object} Internal/Encrypter
 */

'use strict';

/* Methods -------------------------------------------------------------------*/

/** @private */
function mapKeyIn(key) {
  const seed = Number(toUint8(key).join(''));
  const list = new Array(256);
  const dict = new Array(256);

  for (let i = 0; i < 256; i++) {
    const temp = list[i] || i;
    const rand = (seed % (i+1) + i) % 256;
    list[i] = list[rand] || rand;
    list[rand] = temp;
  }

  list.forEach((val, index) => dict[val] = index);

  return dict;
}

/** @private */
function mapKeyOut(key) {
  const seed = Number(toUint8(key).join(''));
  const dict = new Array(256);

  for (let i = 0; i < 256; i++) {
    const temp = dict[i] || i;
    const rand = (seed % (i+1) + i) % 256;
    dict[i] = dict[rand] || rand;
    dict[rand] = temp;
  }

  return dict;
}

/** @private */
function toUint8(str) {
  return str.toString()
    .split('')
    .map(char => char.charCodeAt(0));
}

/** @private */
function byteIn(keyMap, val) {
  return keyMap[val];
}

/** @private */
function byteOut(keyMap, val) {
  return keyMap[val];
}

/**
 * Password-encrypts a message via hashmap
 * @memberof Internal/Encrypter
 * @param {UInt8Array} bytes The bytes to encrypt
 * @param {String} key The password for the encryption (Recommended >16 Characters)
 * @returns {UInt8Array} The encrypted bytes
 */
function encrypt(bytes, key) {
  if (typeof bytes === 'string') bytes = toUint8(bytes);
  return bytes.map(byteIn.bind(null, mapKeyIn(String(key))));
}

/**
 * Password-decrypts a message via hashmap
 * @memberof Internal/Encrypter
 * @param {UInt8Array} bytes The bytes to decrypt
 * @param {String} key The password
 * @returns {UInt8Array} The decrypted bytes
 */
function decrypt(bytes, key) {
  return bytes.map(byteOut.bind(null, mapKeyOut(String(key))));
}

/* Exports -------------------------------------------------------------------*/

module.exports = { encrypt, decrypt };