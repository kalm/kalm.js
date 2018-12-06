/** 
 * KALM Benchmark
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

var settings = require('../settings'); 
var Kalm = require('../../../dist/bundle');

/* Local variables -----------------------------------------------------------*/

var server;
var client;

var count = 0;
var handbreak = true;

/* Methods -------------------------------------------------------------------*/

function setup(resolve) {
	server = Kalm.listen({
		providers: [{
			port: settings.port,
			transport: Kalm.transports[settings.transport](),
			routine: Kalm.routines[settings.routine[0]](settings.routine[1]),
			secretKey: settings.secretKey
		}]
	});

	server.providers.forEach((provider) => {
		provider.on('connection', (c) => {
			c.subscribe(settings.testChannel, (msg) => c.write(settings.testChannel, msg));
		});
	});

	handbreak = false;
	setTimeout(resolve, 0);
}

function teardown(resolve) {
	server.providers.forEach(provider => provider.stop());
	server = null;
	client = null;
	resolve(count);
}

function stop(resolve) {
	handbreak = true;
	setTimeout(resolve, 0);
}

function step(resolve) {
	if (handbreak) return;
	if (!client) {
		client = Kalm.connect({
			port: settings.port, 
			transport: Kalm.transports[settings.transport](),
			routine: Kalm.routines.realtime(),
			secretKey: settings.secretKey
		});
		client.subscribe(settings.testChannel, () => count++);
	}

	client.write(settings.testChannel, settings.testPayload);

	resolve();
}

/* Exports -------------------------------------------------------------------*/

module.exports = {
	setup: setup,
	teardown: teardown,
	step: step,
	stop: stop
};