/** Server class */

'use strict';

/* Requires ------------------------------------------------------------------*/

const debug = require('debug')('kalm');
const clientFactory = require('../clientFactory');
const crypto = require('crypto');

/* Methods -------------------------------------------------------------------*/

function Server(scope) {

  /**
   * @memberof Server
   * @param {string} channel The name of the channel to send to
   * @param {string|object} payload The payload to send
   * @returns {Server} Returns itself for chaining
   */
  function broadcast(channel, payload) {
    scope.connections.forEach(c => c.send(channel, payload));
    return scope;
  }

  /**
   * @memberof Server
   * @param {function} callback The callback method for the operation
   */
  function stop(callback) {
    callback = callback || function() {};
    debug('warn: stopping server');

    if (scope.listener) {
      Promise.resolve()
        .then(() => {
          scope.connections.forEach(connection => connection.destroy());
          scope.connections.length = 0;
          scope.transport.stop(scope, callback);
          scope.listener = null;
        })
        .catch(scope.handleError)
    }
    else {
      scope.listener = null;
      setTimeout(callback, 0);
    }
  }

  /** @private */
  function handleError(err) {
    debug('error: ', err);
    scope.emit('error', err);
  }

  /** @private */
  function handleConnection(socket) {
    const origin = scope.transport.getOrigin(socket);
    const hash = crypto.createHash('sha1');
    hash.update(scope.id);
    hash.update(origin.host);
    hash.update('' + origin.port);

    const client = clientFactory.create({
      id: hash.digest('hex'),
      transport: scope.transport,
      serial: scope.serial,
      catch: scope.catch,
      socket,
      connected: 2,
      secretKey: scope.secretKey,
      isServer: true,
      hostname: origin.host,
      port: origin.port
    });
      
    scope.connections.push(client);
    scope.emit('connection', client);
    client.on('disconnect', scope.emit.bind('disconnection'));
    return client;
  }

  function init() {
    scope.transport.listen({ handleConnection, handleError }, scope, clientFactory)
      .then(listener => scope.listener = listener);
    return scope;
  }

  return { broadcast, stop, connections: [] , init };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Server;