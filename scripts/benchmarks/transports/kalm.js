/**
 * KALM Benchmark
 */


/* Requires ------------------------------------------------------------------*/

const settings = require('../settings');
const Kalm = require('../../../packages/kalm/bin/kalm.min');

const transports = {
  ipc: require('../../../packages/ipc/bin/ipc.min'),
  tcp: require('../../../packages/tcp/bin/tcp.min'),
  udp: require('../../../packages/udp/bin/udp.min'),
  ws: require('../../../packages/ws/bin/ws.min'),
};

/* Local variables -----------------------------------------------------------*/

let server;
let client;

let count = 0;
let handbreak = true;

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
  setup,
  teardown,
  step,
  stop,
};
