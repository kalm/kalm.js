const kalm = require('kalm');
const ws = require('@kalm/ws');

const Server = kalm.listen({
  label: 'server',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.realtime(),
  host: '0.0.0.0',
});

Server.on('connection', (client) => {
  client.subscribe('peering', (channel) => {
    client.subscribe(`${channel}.peering`, (body, frame) => {
      Server.connections
          .filter((connection) => {
              return (connection.label !== client.label && connection.getChannels().includes(`${channel}.peering`));
          })
          .forEach((connection) => {
              connection.write(`${channel}.peering`, body);
          });
    });
  });
});
