/** 
 * Server class
 * @namespace Server
 * @example {
 *   connections: []
 * }
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const debug = require('debug')('kalm');

/* Methods -------------------------------------------------------------------*/

function Server(scope, crypto, clientFactory) {
 
  let disconnectionHandler = null; 

  /**
   * Sends a message to all open connections
   * @memberof Server
   * @param {string} channel The name of the channel to send to
   * @param {string|object} payload The payload to send
   * @returns {Server} Returns itself for chaining
   */
  function broadcast(channel, payload) {
    scope.connections.forEach(c => c.write(channel, payload));
    return scope;
  }

  /**
   * Shuts the server down, flushing all queues and closing all open connections 
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
  function handleConnection(socket, options) {
    const origin = scope.transport.getOrigin(options || socket);
    const hash = crypto.createHash('sha1');
    hash.update(scope.id);
    hash.update(origin.host);
    hash.update('' + origin.port);

    const client = clientFactory.create(Object.assign({
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
    }, options));
      
    scope.connections.push(client);
    scope.emit('connection', client);
    client.on('disconnect', disconnectionHandler);
    debug(`log: connection from ${origin.host}:${origin.port}`);
    return client;
  }

  function init() {
    scope.transport.listen({ handleConnection, handleError }, scope)
      .then(listener => scope.listener = listener);
    disconnectionHandler = scope.emit.bind(scope, 'disconnection');
    
    return scope;
  }

  return { broadcast, stop, connections: [] , init };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Server;