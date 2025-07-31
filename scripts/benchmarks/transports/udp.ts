import { createSocket } from 'dgram';
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
  server = createSocket('udp4');
  server.on('message', () => {
    server.send(Buffer.from(JSON.stringify(settings.testPayload)), 1111, '0.0.0.0');
  });
  handbreak = false;
  server.on('error', _absorb);
  server.bind(settings.port, '0.0.0.0');
  resolve();
}

export function teardown(resolve) {
  server.close(() => {
    server = null;
    client = null;
    resolve(count);
  });
}

export function stop(resolve) {
  handbreak = true;
  setTimeout(resolve, 0);
}

export function step(resolve) {
  if (handbreak) return;
  if (!client) {
    client = createSocket('udp4');
    client.on('error', _absorb);
    client.on('message', () => count++);
    client.bind(1111, '0.0.0.0');
  }

  client.send(Buffer.from(JSON.stringify(settings.testPayload)), settings.port, '0.0.0.0');
  resolve();
}
