import { listen, routines } from 'kalm';
import ws from '@kalm/ws';

/**
 * Creates a kalm server that uses the Websocket transport.
 * It is bound to local IP 0.0.0.0 and listens on port 3938.
 *
 * The tick routine will emit messages to clients at a frequency no higher than 5hz, or no shorter than 20ms
 *
 * This is a common setup for relaying information to multiple connected clients that all send information rapidly.
 */
const provider = listen({
  transport: ws(),
  port: 3938,
  routine: routines.tick({ hz: 5 }),
  host: '0.0.0.0',
});

/**
 * An example interface for messages sent between client and server
 */
type MyCustomPayload = {
  message: string
};

/**
 * First, the server must listen for connection events
 */
provider.on('connection', (client) => {
  /**
   * Once a client has connected, we subscribe to messages sent on the "foo" channel.
   */
  client.subscribe('foo', (body: MyCustomPayload, frame) => {
    /**
     * When we receive a message on the foo channel, we also receive information about the frame and context.
     *
     * body: { message: "hello world!" }
     * frame: {
     *  client: <Client>,
     *  frame: {
     *     channel: "foo",
     *     id: 1,
     *     messageIndex: 1,
     *     payloadBytes: 12,
     *     payloadMessages: 1,
     *   }
     * }
     */
    console.log('Client event', body, frame);
  });

  /**
   * To send messages from the server to the newly connected client, simply `write` to the desired channel.
   */
  client.write('foo', {
    message: 'hello from the server!',
  } as MyCustomPayload);

  /**
   * To send a message to all connected clients, for example to announce that a new client has connected, you may use the `broadcast` function. Again, it is important to specify which channel to use.
   */
  provider.broadcast('foo', {
    message: 'A new client has connected!',
  } as MyCustomPayload);
});

/**
 * The `ready` event lets you know that the server is ready to receive connections
 */
provider.on('ready', () => {
  console.log('The server is now listening on port 3938');
});
