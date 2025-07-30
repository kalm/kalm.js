/**
 * KALM Benchmark
 */

/* Requires ------------------------------------------------------------------ */

const io = require('socket.io');
const http = require('http');
const ioclient = require('socket.io-client');

const settings = require('../settings');

/* Local variables ----------------------------------------------------------- */

let server;
let client;

let count = 0;
let handbreak = true;

/* Methods ------------------------------------------------------------------- */

function _absorb(err) {
  console.log(err); /* eslint-disable-line */
  return true;
}

function setup(resolve) {
  server = io();
  handbreak = false;
  server.on('connection', (socket) => {
    socket.on('data', () => socket.emit('data', JSON.stringify(settings.testPayload)));
  });
  server.on('error', _absorb);
  server.listen(http.createServer().listen(settings.port, '0.0.0.0'));
  setTimeout(resolve, 10);
}

function teardown(resolve) {
  if (client) client.close();
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
    client = ioclient(`http://0.0.0.0:${settings.port}`);
    client.on('error', _absorb);
    client.on('data', () => count++);
  }

  client.emit('data', JSON.stringify(settings.testPayload));
  resolve();
}

/* Exports ------------------------------------------------------------------- */

module.exports = {
  setup,
  teardown,
  step,
  stop,
};
