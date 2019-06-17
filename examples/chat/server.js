const kalm = require('kalm');
const ws = require('@kalm/ws');

const Server = kalm.listen({
  label: 'server',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.tick(5), // Hz
  host: '0.0.0.0',
});

Server.on('connection', (client) => {
  client.subscribe('c.evt', (msg, evt) => {
    Server.broadcast('r.evt', msg);
  });

  Server.broadcast('r.sys', { msg: 'user joined' });
});

Server.on('deconnection', (client) => {
  Server.broadcast('r.sys', { msg: 'user left' });
});
