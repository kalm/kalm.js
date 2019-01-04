const kalm = require('../../packages/kalm/bin/kalm');
const ws = require('../../packages/ws/bin/ws');

const Server = kalm.listen({
    providers: [
        {
            label: 'server',
            port: 8800,
            transport: ws(),
            routine: kalm.routines.tick(5), // Hz
        },
    ],
    host: '0.0.0.0',
});

Server.providers.forEach((provider) => {
    provider.on('connection', (client) => {
        client.subscribe('c.evt', (msg, evt) => {
            provider.broadcast('r.evt', msg);
        });

        provider.broadcast('r.sys', { msg: 'user joined' });
    });

    provider.on('deconnection', (client) => {
        provider.broadcast('r.sys', { msg: 'user left' });
    });
});