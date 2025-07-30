/**
 * KALM Benchmark
 */

/* Requires ------------------------------------------------------------------ */

const settings = require('../settings');
const Kalm = require('../../../packages/kalm/dist/kalm');

const transports = {
  ipc: require('../../../packages/ipc/dist/ipc'),
  tcp: require('../../../packages/tcp/dist/tcp'),
  udp: require('../../../packages/udp/dist/udp'),
  ws: require('../../../packages/ws/dist/ws'),
};

/* Local variables ----------------------------------------------------------- */

let server;
let client;

let count = 0;
let accDensity = 0;
let handbreak = true;

/* Methods ------------------------------------------------------------------- */

function setup(resolve) {
  server = Kalm.listen({
    port: settings.port,
    json: true,
    transport: transports[settings.transport](),
    routine: Kalm.routines[settings.routine[0]](settings.routine[1]),
  });

  server.addEventListener('connection', (c) => {
    c.subscribe(settings.testChannel, msg => c.write(settings.testChannel, msg));
  });

  server.addEventListener('error', (e) => {
    console.error('Server error:', e);
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
    client.subscribe(settings.testChannel, (body, frame) => {
      // console.log('got it', frame)
      count++;
    });

    client.addEventListener('error', (e) => {
      console.error('Client error:', e);
    });
  }

  client.write(settings.testChannel, settings.testPayload);

  resolve();
}

/* Exports ------------------------------------------------------------------- */

module.exports = {
  setup,
  teardown,
  step,
  stop,
};
