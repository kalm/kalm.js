const { listen } = require('kalm');
const wss = require('kalm-secure-websockets');
const heartbeat = require('kalm/profiles/heartbeat');

const Server = listen({
    providers: [
        // Min config
        {
            label: 'server',
            transport: wss,
            options: {
                cert: '...',
                key: '...',
            },
            profile: heartbeat,
        },
    ],
    host: '0.0.0.0',
});

Server.providers((provider) => {
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