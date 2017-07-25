/* Errors and input validation */

'use strict';

/* Requires ------------------------------------------------------------------*/

const debug = require('debug')('kalm');

/* Methods -------------------------------------------------------------------*/

/** @private */
function validateOptions(options) {
    if (!options) return true;

    if (options.hostname) validateTypes('hostname', options.hostname, ['string']);
    if (options.port) validateTypes('port', options.port, ['number', 'string']);
    if (options.secretKey) {
        validateTypes('secretKey', options.secretKey, ['string']);
        if (options.secretKey.length < 16) debug('warn: secretKey shorter than 16 characters are not recommended');
    }
    if (options.transport) {
        validateTypes('transport.listen', options.transport.listen, ['function']);
        validateTypes('transport.getOrigin', options.transport.getOrigin, ['function']);
        validateTypes('transport.createSocket', options.transport.createSocket, ['function']);
        validateTypes('transport.attachSocket', options.transport.attachSocket, ['function']);
        validateTypes('transport.stop', options.transport.stop, ['function']);
        validateTypes('transport.send', options.transport.send, ['function']);
        validateTypes('transport.disconnect', options.transport.disconnect, ['function']);
    }
    if (options.serial) {
        validateTypes('serial.encode', options.serial.encode, ['function']);
        validateTypes('serial.decode', options.serial.decode, ['function']);
    }
    if (options.profile) {
        if (options.profile.tick) validateTypes('profile.tick', options.profile.tick, ['number', null]);
        if (options.profile.maxBytes) validateTypes('profile.maxBytes', options.profile.maxBytes, ['number', null]);
    }
}

/** @private */
function validateTypes(key, value, types) {
    if (types.every(type => (typeof value !== type || value === type))) throw TypeError(key, value, types);
}

/** @private */
function TypeError(key, value, expected) {
    return new Error(`${key} (${value}) is not of expected type(s) ${JSON.stringify(expected)}`);
}

/* Exports -------------------------------------------------------------------*/

module.exports = { validateOptions };