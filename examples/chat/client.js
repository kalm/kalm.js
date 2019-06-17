const kalm = require('kalm');
const ws = require('@kalm/ws');
const { randomBytes } = require('crypto');

const Client = kalm.connect({
  label: randomBytes(4).toString('hex'),
  host: '0.0.0.0',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.realtime(),
});

Client.subscribe('r.evt', (evt, frame) => console.log(`${evt.name}: ${evt.msg}`, frame));
Client.subscribe('r.sys', (evt, frame) => console.log(`[System]: ${evt.msg}`, frame));

Client.on('connect', () => {
  Client.write('c.evt', { name: Client.label, msg: 'Hey everyone!' });
});

Client.on('disconnect', () => {
  console.log('--Connection lost--');
});
