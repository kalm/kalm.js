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

    if (scope.connections.length > 0) {
      Promise.resolve()
        .then(() => {
          scope.connections.forEach(connection => connection.destroy());
          scope.connections.length = 0;
        });
    }

    scope.ports.forEach((port) => {
      if (port.listener) {
        Promise.resolve()
          .then(() => {
            port.transport.stop(scope, callback);
            port.listener = null;
          })
          .catch(scope.handleError)
      }
      else {
        port.listener = null;
        setTimeout(callback, 0);
      }
    });
  }

  /** @private */
  function handleError(err) {
    debug('error: ', err);
    scope.emit('error', err);
  }

  /** @private */
  function handleConnection(socket, transport, options) {
    const origin = transport.getOrigin(socket || options);
    const hash = crypto.createHash('sha1');
    hash.update(scope.id);
    hash.update(origin.host);
    hash.update('' + origin.port);

    const client = clientFactory.create(Object.assign({
      id: hash.digest('hex'),
      transport,
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
    scope.ports.forEach((port) => {
      port.transport.listen({ handleConnection, handleError }, Object.assign({}, scope, port))
        .then(listener => port.listener = listener);
      disconnectionHandler = scope.emit.bind(scope, 'disconnection');
    });
    
    return scope;
  }

  return { broadcast, stop, connections: [] , init };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Server;