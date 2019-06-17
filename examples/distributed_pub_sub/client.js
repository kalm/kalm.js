const crypto = require('crypto');
const kalm = require('kalm');
const ws = require('@kalm/ws');

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
    message: 'hello world!',
  });
}, 2000);
