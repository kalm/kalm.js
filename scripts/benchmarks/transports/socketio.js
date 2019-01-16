/** 
 * KALM Benchmark
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const io = require('socket.io');
const http = require('http');
const ioclient = require('socket.io-client');

var settings = require('../settings'); 

/* Local variables -----------------------------------------------------------*/

var server;
var client;

var count = 0;
var handbreak = true;

/* Methods -------------------------------------------------------------------*/

function _absorb(err) {
    console.log(err);
	return true;
}

function setup(resolve) {
	server = io();
    handbreak = false;
    server.on('connection', socket => {
        socket.on('data', () => socket.emit('data', JSON.stringify(settings.testPayload)));
    });
	server.on('error', _absorb);
    server.listen(http.createServer().listen(settings.port, '0.0.0.0'));
    setTimeout(resolve, 10);
}

function teardown(resolve) {
	if (client) client.close();
	if (server) server.close(function() {
		server = null;
		client = null;
		resolve(count);
	});
}

function stop(resolve) {
	handbreak = true;
	setTimeout(resolve, 0);
}

function step(resolve) {
	if (handbreak) return;
	if (!client) {
		client = ioclient('http://0.0.0.0:' + settings.port);
		client.on('error', _absorb);
		client.on('data', () => count++);
	}

	client.emit('data', JSON.stringify(settings.testPayload));
    resolve();
}

/* Exports -------------------------------------------------------------------*/

module.exports = {
	setup: setup,
	teardown: teardown,
	step: step,
	stop: stop
};