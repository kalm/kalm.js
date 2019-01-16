/** 
 * KALM Benchmark
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

var settings = require('../settings'); 
var Kalm = require('../../../packages/kalm/bin/kalm');
var transports = {
	ipc: require('../../../packages/ipc/bin/ipc'),
	tcp: require('../../../packages/tcp/bin/tcp'),
	udp: require('../../../packages/udp/bin/udp'),
	ws: require('../../../packages/ws/bin/ws'),
}

/* Local variables -----------------------------------------------------------*/

var server;
var client;

var count = 0;
var handbreak = true;

/* Methods -------------------------------------------------------------------*/

function setup(resolve) {
	server = Kalm.listen({
		port: settings.port,
		json: true,
		transport: transports[settings.transport](),
		routine: Kalm.routines[settings.routine[0]](settings.routine[1]),
	});

	server.on('connection', (c) => {
		c.subscribe(settings.testChannel, (msg) => c.write(settings.testChannel, msg));
	});

	handbreak = false;
	setTimeout(resolve, 0);
}

function teardown(resolve) {
	server.stop();
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
			json: true,
			transport: transports[settings.transport](),
			routine: Kalm.routines.realtime(),
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