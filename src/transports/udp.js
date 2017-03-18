/**
 * UDP transport methods
 * @module transports.UDP
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const dgram = require('dgram');

/* Local variables -----------------------------------------------------------*/

const _socketType = 'udp4';
const _keySeparator = ':';
const _localAddress = '0.0.0.0';
const _reuseAddr = true;

/* Methods -------------------------------------------------------------------*/

/** @private */
function _handleNewSocket(server, clientFactory, data, origin) {
	let key = [origin.address, _keySeparator, origin.port].join();

	if (!server.__clients) server.__clients = {};
	if (!(key in server.__clients)) {
		server.__clients[key] = clientFactory.create({
			hostname: origin.address,
			port: origin.port,
			transport: server.transport,
			serial: server.serial,
			secretKey: server.secretKey,
			pending: data
		});
	}
}

/**
 * @param {object} handlers The server handlers
 * @param {object} options The options for the listener
 * @returns {Promise(object)} The new listener
 */
function listen(handlers, options, clientFactory) {
	const listener = dgram.createSocket({ type: _socketType, reuseAddr: _reuseAddr });
	listener.on('message', _handleNewSocket.bind(null, options, clientFactory));
	listener.on('error', handlers.handleError);
	listener.bind(options.port, _localAddress);
		
	return Promise.resolve(listener);
}

/**
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
 * @param {Socket} socket The socket to use
 * @param {Buffer} payload The body of the request
 */
function send(socket, payload) {
	socket.send(payload, 0, payload.length, socket._port, socket._hostname);
}

/**
 * @param {Server} server The server object
 * @param {function} callback The success callback for the operation
 */
function stop(server, callback) {
	server.listener.close();
	setTimeout(callback, 0);
}

/**
 * @param {Client} client The client to create the socket for
 * @returns {Socket} The created tcp client
 */
function createSocket(client) {
	let socket = dgram.createSocket(_socketType);
	socket._port = client.port;
	socket._hostname = client.hostname;
	return socket;
}

/**
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
 * @param {Client} client The client to disconnect
 * @param {function} callback The callback method
 */
function disconnect(client, callback) {
	setTimeout(callback, 0); // Nothing to do
}


/* Exports -------------------------------------------------------------------*/

module.exports = { listen, getOrigin, stop, send, disconnect, createSocket, attachSocket };