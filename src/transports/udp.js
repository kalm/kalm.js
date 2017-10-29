/**
 * UDP transport methods
 * @category transports
 * @namespace {object} transports/UDP
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const dgram = require('dgram');

/* Local variables -----------------------------------------------------------*/

const _socketType = 'udp4';
const _keySeparator = ':';
const _localAddress = '0.0.0.0';
const _clientCache = {};
const _reuseAddr = true;

/* Methods -------------------------------------------------------------------*/

/** @private */
function resolveClient(origin, handlers, options) {
  const key = `${origin.address}.${origin.port}`;
  if (!_clientCache.hasOwnProperty(key)) {
    _clientCache[key] = {
      client: handlers.handleConnection(null, module.exports, {
        hostname: origin.address, 
        port: origin.port,
        connected: 0,
        _hostname: options.hostname,
        _port: options.port
      }),
      timeout: null,
      cleanup: () => { 
        _clientCache[key].destroy(() => { delete _clientCache[key]; });
      }
    };
  }
  else {
    clearTimeout(_clientCache[key].timeout);
  }

  _clientCache[key].timeout = setTimeout(_clientCache[key].cleanup, options.socketTimeout);
  return _clientCache[key].client;
}

/**
 * Starts listening for incomming connections
 * @memberof transports/UDP
 * @param {object} handlers The server handlers
 * @param {object} options The options for the listener
 * @returns {Promise(object)} The new listener
 */
function listen(handlers, options) {
  const listener = dgram.createSocket({ type: _socketType, reuseAddr: _reuseAddr });
  listener.on('message', (data, origin) => resolveClient(origin, handlers, options).handleRequest(data));
  listener.on('error', handlers.handleError);
  listener.bind(options.port, _localAddress);
  return Promise.resolve(listener);
}

/**
 * Gets the socket destination info
 * @memberof transports/UDP
 * @param {Socket} socket a socket handle
 * @returns {object} The host and port info for that socket
 */
function getOrigin(socket) {
  return {
    host: socket._hostname,
    port: socket._port
  };
}

/**
 * Sends the frame via the client socket
 * @memberof transports/UDP
 * @param {Socket} socket The socket to use
 * @param {Buffer} payload The body of the request
 */
function send(socket, payload) {
  socket.send([payload], socket._port, socket._hostname);
}

/**
 * Stops the server, closing all current connections
 * @memberof transports/UDP
 * @param {Server} server The server object
 * @param {function} callback The success callback for the operation
 */
function stop(port, callback) {
  port.listener.close();
  setTimeout(callback, 0);
}

/**
 * Creates a socket handle
 * @memberof transports/UDP
 * @param {Client} client The client to create the socket for
 * @returns {Socket} The created tcp client
 */
function createSocket(port) {
  let socket = dgram.createSocket(_socketType);
  socket._port = socket._port || port.port;
  socket._hostname = socket._hostname || port.hostname;
  return socket;
}

/**
 * Binds the proper listeners to the socket
 * @memberof transports/UDP
 * @param {Socket} socket A socket handle
 * @param {object} handlers A collection of handlers to attach
 */
function attachSocket(socket, handlers) {
  socket.on('error', handlers.handleError);
  socket.on('message', handlers.handleRequest);
  if (socket.pending) {
    handlers.handleRequest(socket.pending);
    delete socket.pending;
  }
  setTimeout(handlers.handleConnect, 0);
  // Bind socket to also listen on it's address
  socket.bind(null, _localAddress);
}

/**
 * Disconnects the socket
 * @memberof transports/UDP
 * @param {Client} client The client to disconnect
 * @param {function} callback The callback method
 */
function disconnect(port, callback) {
  setTimeout(callback, 0); // Nothing to do
}


/* Exports -------------------------------------------------------------------*/

module.exports = { listen, getOrigin, stop, send, disconnect, createSocket, attachSocket };