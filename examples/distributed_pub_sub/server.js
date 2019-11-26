const kalm = require('kalm');
const ws = require('@kalm/ws');
const tcp = require('@kalm/tcp');

const seed = { host: '0.0.0.0', port: 3000 };
const tickSeed = Date.now();

const seedHost = '0.0.0.0'; // Apply seed config

const providers = [
  kalm.listen({
    label: 'internal',
    transport: tcp(),
    port: 3000,
    routine: kalm.routines.realtime(),
    host: '0.0.0.0', // Apply local ip
  }),
  kalm.listen({
    label: 'external',
    transport: ws(),
    port: 3938,
    routine: kalm.routines.tick({ hz: 120, seed: tickSeed }),
    host: '0.0.0.0', // Apply local ip
  }),
];

providers.forEach((provider) => {
  const isIntern = provider.label === 'internal';
  const isSeed = (isIntern && seed.host === seedHost);

  if (!isSeed && isIntern) {
    kalm.connect({}).write('n.add', { host: seedHost });
  }

  provider.on('connection', (client) => {
    if (isIntern) {
      client.subscribe('n.add', (body, frame) => {
        if (isSeed) {
          provider.broadcast('n.add', body);
        } else provider.connect(frame.remote);
      });
      client.subscribe('n.evt', (body, frame) => {
        providers.forEach((_provider) => {
          if (_provider.label === 'external') {
            _provider.broadcast('r.evt', body);
          }
        });
      });
    } else {
      client.subscribe('c.evt', (body, frame) => {
        providers.forEach((_provider) => {
          if (_provider.label === 'internal') {
            _provider.broadcast('n.evt', body);
          } else {
            _provider.broadcast('r.evt', body);
          }
        });
      });
    }
  });
});
