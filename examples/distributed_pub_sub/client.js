const { randomBytes } = require('node:crypto');
const kalm = require('kalm');
const ws = require('@kalm/ws');

/**
 * Generates a unique Id for our client
 */
const clientId = randomBytes(4).toString('hex');

/**
 * Creates a kalm client that uses the Websocket transport.
 * It will attempt to connect to a server located at the address and port provided in the process arguments
 */
const client = kalm.connect({
  label: clientId,
  transport: ws(),
  port: process.argv.at(-1),
  routine: kalm.routines.realtime(),
  host: process.argv.at(-2),
});

console.log('Creating client', clientId, '...');

/**
 * To confirm that the client has succesfully connected to the server, listen to the 'connect' event.
 */
client.on('connect', () => {
  console.log('Client', clientId, 'has joined the network.');

  /**
   * Subscribes to messages on a channel named r.evt (Response Event).
   */
  client.subscribe('r.evt', (body, frame) => {
    /**
     * We'll ignore our own messages
     */
    if (body.origin !== clientId) {
      /**
       * Whenever we receive a message, which may have come from a different server entirely, we will print it
       */
      console.log('Relayed event', body);
    }
  });

  // now send some events
  setInterval(() => {
    client.write('c.evt', {
      origin: clientId,
      timestamp: Date.now(),
      message: 'hello world!',
    });
  }, 2000);
});
