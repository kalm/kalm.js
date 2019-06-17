/**
 * KALM Benchmark
 */


/* Requires ------------------------------------------------------------------*/

const net = require('net');
const settings = require('../settings');

/* Local variables -----------------------------------------------------------*/

let server;
let client;

let count = 0;
let handbreak = true;

/* Methods -------------------------------------------------------------------*/

function _absorb(err) {
  console.log(err); /* eslint-disable-line */
}

function setup(resolve) {
  server = net.createServer((socket) => {
    socket.on('data', () => socket.write(JSON.stringify(settings.testPayload)));
    socket.on('error', _absorb);
  });
  handbreak = false;
  server.on('error', _absorb);
  server.listen(settings.port, resolve);
}

function teardown(resolve) {
  if (client) client.destroy();
  if (server) {
    server.close(() => {
      server = null;
      client = null;
      resolve(count);
    });
  }
}

function stop(resolve) {
  handbreak = true;
  setTimeout(resolve, 0);
}

function step(resolve) {
  if (handbreak) return;
  if (!client) {
    client = net.connect(settings.port, '0.0.0.0');
    client.on('error', _absorb);
    client.on('data', () => count++);
  }

  client.write(JSON.stringify(settings.testPayload));
  resolve();
}

/* Exports -------------------------------------------------------------------*/

module.exports = {
  setup,
  teardown,
  step,
  stop,
};
