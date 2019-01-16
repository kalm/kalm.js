const kalm = require('../../packages/kalm/bin/kalm');
const ws = require('../../packages/ws/bin/ws');
const tcp = require('../../packages/tcp/bin/tcp');

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
        routine: kalm.routines.tick(120, tickSeed),
        host: '0.0.0.0', // Apply local ip
    })
];

providers.forEach((provider) => {
    const isIntern = provider.label === 'internal';
    const isSeed = (isIntern && seed.host === seedHost);

    if (!isSeed && isIntern) {
        kalm.connect({}).write('n.add', { host: seedHost });
    }

    provider.on('connection', (client) => {
        if (isIntern) {
            client.subscribe('n.add', (msg, evt) => {
                if (isSeed) {
                    provider.broadcast('n.add', msg);
                }
                else provider.connect(evt.remote);
            });
            client.subscribe('n.evt', (msg, evt) => {
                providers.forEach((_provider) => {
                    if (_provider.label === 'external') {
                        _provider.broadcast('r.evt', msg);
                    }
                });
            });
        } else {
            client.subscribe('c.evt', (msg, evt) => {
                providers.forEach((_provider) => {
                    if (_provider.label === 'internal') {
                        _provider.broadcast('n.evt', msg);
                    } else {
                        _provider.broadcast('r.evt', msg);
                    }
                });
            });
        }
    });
});
