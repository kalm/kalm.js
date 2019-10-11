//const kalm = require('kalm');
//const ws = require('@kalm/ws');

const kalm = require('../../packages/kalm/bin/kalm');
const ws = require('../../packages/ws/bin/ws');

const Server = kalm.listen({
  label: 'server',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.tick(5), // Hz
  host: '0.0.0.0',
});

Server.on('connection', (client) => {
  client.subscribe('c.evt', (body, frame) => {
    Server.broadcast('r.evt', body);
  });

  Server.broadcast('r.sys', { msg: 'user joined' });
});

Server.on('deconnection', (client) => {
  Server.broadcast('r.sys', { msg: 'user left' });
});
