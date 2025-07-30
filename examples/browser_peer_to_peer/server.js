const kalm = require('../../packages/kalm');
const ws = require('../../packages/ws');

/**
 * Creates a kalm server that uses the Websocket transport.
 * It is bound to local IP 0.0.0.0 and listens on port 9001.
 *
 * The realtime routine will emit messages to clients as soon as possible
 *
 * The purpose of this server is to advertise the existence of connected clients and facilitate the exchange of signal data for WebRTC connection
 */
const Server = kalm.listen({
  label: 'server',
  port: 9001,
  transport: ws(),
  routine: kalm.routines.realtime(),
  host: '0.0.0.0',
});

Server.on('connection', (client) => {

  /**
   * When we receive peering messages, we expect that a new client is advertising.
   * We'll label it. The label property on Kalm Clients and Server can be anything and can also be defined in config.
   * Note that labels do not travel over the wire and are only assigned to local instances.
   */
  client.subscribe('peering', (adv) => {
    client.label = adv;
    Server.broadcast('peering', Server.connections.map(c => c.label));
  });

  /**
   * Candidate messages means that two nodes are in the process of exchanging information.
   * We'll ensure that the right message get to the right node by filtering on the label property we set earlier.
   */
  client.subscribe('candidate', (answer) => {
    const match = Server.connections.find((c) => c.label.sdp === answer.target);
    if (match) {
      match.write('candidate', answer);
    }
  });

  /**
   * When a client disconnects from the server, we'll also notify other connected clients
   */
  client.on('disconnect', () => {
    Server.broadcast('peering', Server.connections.map(c => c.label));
  });
});

Server.on('ready', () => {
  console.log('Server is ready and listening on port 9001');
});
