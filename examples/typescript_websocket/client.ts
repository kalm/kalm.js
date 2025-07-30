import { connect, routines } from 'kalm';
import ws from '@kalm/ws';

/**
 * Creates a kalm client that uses the Websocket transport.
 * It will attempt to connect to a server located at the address '0.0.0.0' on port 3938.
 *
 * The realtime routine will emit messages as soon as possible. While this is ideal in a few scenarios, for instance when the client does not send a lot of events,
 * it does not leverage the benefits of buffering and may cause slowdowns if many messages are sent rapidly.
 */
const client = connect({
  transport: ws({}),
  port: 3938,
  host: '0.0.0.0',
  routine: routines.realtime(),
});

/**
 * An example interface for messages sent between client and server
 */
type MyCustomPayload = {
  message: string
};

/**
 * To confirm that the client has succesfully connected to the server, listen to the 'connect' event.
 */
client.on('connect', () => {
  /**
   * Once a client has connected, we subscribe to messages sent on the "foo" channel.
   */
  client.subscribe('foo', (body: MyCustomPayload, context) => {
    /**
     * When we receive a message on the foo channel, we also receive information about the frame and context.
     *
     * body: { message: "hello from the server!" }
     * context: {
     *  client: <Client>,
     *  frame: {
     *     channel: "foo",
     *     id: 1,
     *     messageIndex: 1,
     *     payloadBytes: 22,
     *     payloadMessages: 1,
     *   }
     * }
     */
    console.log('Server event', body, context);
  });

  /**
   * To send messages from the client to the server, simply `write` to the desired channel.
   */
  client.write('foo', { message: 'hello world!' });
});
