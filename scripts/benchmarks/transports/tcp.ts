import { createServer, connect } from 'net';
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
  server = createServer((socket) => {
    socket.on('data', () => socket.write(JSON.stringify(settings.testPayload)));
    socket.on('error', _absorb);
  });
  handbreak = false;
  server.on('error', _absorb);
  server.listen(settings.port, resolve);
}

export function teardown(resolve) {
  if (client) client.destroy();
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
    client = connect(settings.port, '0.0.0.0');
    client.on('error', _absorb);
    client.on('data', () => count++);
  }

  client.write(JSON.stringify(settings.testPayload));
  resolve();
}
