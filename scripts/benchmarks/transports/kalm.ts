import settings from '../settings.ts';
import kalm from '../../../packages/kalm/dist/kalm.js';

import ipc from '../../../packages/ipc/dist/ipc.js';
import tcp from '../../../packages/tcp/dist/tcp.js';
import udp from '../../../packages/udp/dist/udp.js';
import ws from '../../../packages/ws/dist/ws.js';

const transports = { ipc, tcp, udp, ws };

let server;
let client;

let count = 0;
let handbreak = true;

export function setup(resolve) {
  server = kalm.listen({
    port: settings.port,
    json: true,
    transport: transports[settings.transport](),
    routine: kalm.routines[settings.routine[0]](settings.routine[1]),
  });

  server.on('connection', (c) => {
    c.subscribe(settings.testChannel, msg => c.write(settings.testChannel, msg));
  });

  server.on('error', (e) => {
    console.error('Server error:', e);
  });

  handbreak = false;
  setTimeout(resolve, 0);
}

export function teardown(resolve) {
  server.stop();
  server = null;
  client = null;
  resolve(count);
}

export function stop(resolve) {
  handbreak = true;
  setTimeout(resolve, 0);
}

export function step(resolve) {
  if (handbreak) return;
  if (!client) {
    client = kalm.connect({
      port: settings.port,
      json: true,
      transport: transports[settings.transport](),
      routine: kalm.routines.realtime(),
    });
    client.subscribe(settings.testChannel, () => {
      // console.log('got it', frame)
      count++;
    });

    client.on('error', (e) => {
      console.error('Client error:', e);
    });
  }

  client.write(settings.testChannel, settings.testPayload);

  resolve();
}
