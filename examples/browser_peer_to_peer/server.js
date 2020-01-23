const kalm = require('kalm');
const ws = require('@kalm/ws');

const Server = kalm.listen({
  label: 'server',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.realtime(),
  host: '0.0.0.0',
});

const roomPassword = 'some_random_string';

Server.on('connection', (client) => {
  client.subscribe(`${roomPassword}.peering`, (body, frame) => {
    Server.connections
        .filter((connection) => {
            return (connection.label !== client.label && connection.getChannels().includes(`${roomPassword}.peering`));
        })
        .forEach((connection) => {
            connection.write(`${roomPassword}.peering`, body);
        });
  });
});
