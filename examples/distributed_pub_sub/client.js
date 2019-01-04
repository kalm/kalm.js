const kalm = require('../../packages/kalm/bin/kalm');
const ws = require('../../packages/ws/bin/ws');
const crypto = require('crypto');

const clientId = crypto.randomBytes(4).toString('hex');

const Client = kalm.connect({
    label: clientId,
    transport: ws(),
    port: 3938,
    routine: kalm.routines.realtime(),
});

Client.subscribe('r.evt', (evt, frame) => {
    console.log('Relayed event', evt, frame);
});

// now send some events
setInterval(() => {
    Client.write('c.evt', {
        origin: clientId,
        timestamp: Date.now(),
        message: 'hello world!'
    });
}, 2000);