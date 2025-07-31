import * as io from 'socket.io';
import http from 'http';
import ioclient from 'socket.io-client';

import settings from '../settings.ts';

let server;
let client;

let count = 0;
let handbreak = true;

function _absorb(err) {
  console.log(err);
  return true;
}

export function setup(resolve) {
  server = new io.Server();
  handbreak = false;
  server.on('connection', (socket) => {
    socket.on('data', () => socket.emit('data', JSON.stringify(settings.testPayload)));
  });
  server.on('error', _absorb);
  server.listen(http.createServer().listen(settings.port, '0.0.0.0'));
  setTimeout(resolve, 10);
}

export function teardown(resolve) {
  if (client) client.close();
  if (server) {
    server.close(() => {
      server = null;
      client = null;
      resolve(count);
    });
  }
}

export function stop(resolve) {
  handbreak = true;
  setTimeout(resolve, 0);
}

export function step(resolve) {
  if (handbreak) return;
  if (!client) {
    client = ioclient(`http://0.0.0.0:${settings.port}`);
    client.on('error', _absorb);
    client.on('data', () => count++);
  }

  client.emit('data', JSON.stringify(settings.testPayload));
  resolve();
}
