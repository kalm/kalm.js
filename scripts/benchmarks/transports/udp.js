/**
 * KALM Benchmark
 */

/* Requires ------------------------------------------------------------------ */

const dgram = require('dgram');

const settings = require('../settings');

/* Local letiables ----------------------------------------------------------- */

let server;
let client;

let count = 0;
let handbreak = true;

/* Methods ------------------------------------------------------------------- */

function _absorb(err) {
  console.log(err); /* eslint-disable-line */
}

function setup(resolve) {
  server = dgram.createSocket('udp4');
  server.on('message', () => {
    server.send(Buffer.from(JSON.stringify(settings.testPayload)), 1111, '0.0.0.0');
  });
  handbreak = false;
  server.on('error', _absorb);
  server.bind(settings.port, '0.0.0.0');
  resolve();
}

function teardown(resolve) {
  server.close(() => {
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
    client = dgram.createSocket('udp4');
    client.on('error', _absorb);
    client.on('message', () => count++);
    client.bind(1111, '0.0.0.0');
  }

  client.send(Buffer.from(JSON.stringify(settings.testPayload)), settings.port, '0.0.0.0');
  resolve();
}

/* Exports ------------------------------------------------------------------- */

module.exports = {
  setup,
  teardown,
  step,
  stop,
};
