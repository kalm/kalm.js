/*
[x] multi-server
[x] tick revised
[ ] stats 
[ ] user error handling 
[x] realtime as default 
[ ] udp handshake
[ ] proper remote ID (wss)
[x] reconnection --- they can handle themselves : on('disconnect')
[x] cert support
*/

// Usage

const { listen, connect, routines, transports, formats } = require('kalm');

const Server = listen({
    providers: [
        // Min config
        {
            label: 'external',
        },
        // Full config
        {
            label: 'internal',
            transport: transports.TCP,
            port: 3000,
            format: formats.JSON,
            stats: true,
            secretKey: '123',
            routine: routines.tick(90),
            socketTimeout: 300000,
            options: { seed: { host: '0.0.0.0', port: 3000 }, cert: {} },
        }
    ],
    host: '0.0.0.0',
});

Server.providers((provider) => {
    const isIntern = provider.port === provider.options.seed.port;
    const isSeed = (isIntern && provider.options.seed.host === Server.host);

    if (!isSeed) {
        connect({}).write('n.add', { host: Server.host });
    }

    provider.on('connection', (client) => {
        if (isIntern) {
            client.subscribe('n.add', (msg, evt) => {
                if (isSeed) {
                    provider.broadcast('n.add', msg);
                }
                else provider.connect(evt.remote);
            });
        }

        // Client event = client -> node
        // Node event = node -> node
        // Relayed event = node -> client
        if (isIntern) {
            client.subscribe('n.evt', (msg, evt) => {
                Server.providers((_provider) => {
                    if (_provider.label === 'external') {
                        _provider.broadcast('r.evt', msg);
                    }
                });
            });

            client.subscribe('c.evt', (msg, evt) => {
                provider.broadcast('n.evt', msg);
            });
        }
    });
});

/*
    // client
    {
        id: <string>
        provider: <Provider>
        connected:
        socket:
        options:
        remote:

        write:
        subscribe:
        unsubscribe:
        queue:
        destroy:

        on:
        once:
        ...
    }

    // provider
    {
        id:
        label:
        server:
        handle:
        port:
        options:

        clients:
        broadcast:
        close:
        connect:

        on:
        once:
        ...
    }

    // server
    {
        id:
        config:
        host:

        providers:
        addProvider:
        removeProvider:
    }

    // message - event
    <any>,
    {
        client:
        stats: {
            timestamp:
            queue:
            serialize:
            wrap:
        }
        frame: {
            id:
            channel:
            payloadBytes:
            payloadMessages:
            messageIndex:
        },
    }

*/
