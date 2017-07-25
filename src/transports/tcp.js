/**
 * TCP transport methods
 * @category transports
 * @namespace {object} transports/TCP
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const net = require('net');

/* Methods -------------------------------------------------------------------*/

/**
 * Starts listening for incomming connections
 * @memberof transports/TCP
 * @param {object} handlers The server handlers
 * @param {object} options The options for the listener
 * @returns {Promise(object)} The new listener
 */
function listen (handlers, options) {
  return new Promise(resolve => {
    const listener = net.createServer(handlers.handleConnection);
    listener.on('error', handlers.handleError);
    listener.listen(options.port, resolve.bind(null, listener));
  });
}

/**
 * Gets the socket destination info
 * @memberof transports/TCP
 * @param {Socket} socket a socket handle
 * @returns {object} The host and port info for that socket
 */
function getOrigin(socket) {
  return {
    host: socket.remoteAddress,
    port: socket.remotePort
  };
}

/**
 * Creates a socket handle
 * @memberof transports/TCP
 * @param {Client} client The client to create the socket for
 * @returns {Socket} The created tcp client
 */
function createSocket(client) {
  return net.connect(client.port, client.hostname);
}

/**
 * Binds the proper listeners to the socket
 * @memberof transports/TCP
 * @param {Socket} socket A socket handle
 * @param {object} handlers A collection of handlers to attach
 */
function attachSocket(socket, handlers) {
  socket.on('data', handlers.handleRequest);
  socket.on('error', handlers.handleError);
  socket.on('connect', handlers.handleConnect);
  socket.on('close', handlers.handleDisconnect);
  socket.on('timeout', () => disconnect({ socket }, handlers.handleDisconnect));
  socket.setTimeout(handlers.socketTimeout);
}

/**
 * Stops the server, closing all current connections
 * @memberof transports/TCP
 * @param {Server} server The server object
 * @param {function} callback The success callback for the operation
 */
function stop(server, callback) {
  server.listener.close(() => setTimeout(callback, 0));
}

/**
 * Sends the frame via the client socket
 * @memberof transports/TCP
 * @param {Socket} socket The socket to use
 * @param {Buffer} payload The body of the request
 */
function send(socket, payload) {
  socket.write(payload);
}

/**
 * Disconnects the socket
 * @memberof transports/TCP
 * @param {Client} client The client to disconnect
 * @param {function} callback The callback method
 */
function disconnect(client, callback) {
  client.socket.end();
  client.socket.destroy();
  setTimeout(callback, 0);
}

/* Exports -------------------------------------------------------------------*/

module.exports = { listen, getOrigin, stop, send, disconnect, createSocket, attachSocket };