import { connect, routines } from 'kalm';
import ws from '@kalm/ws';

/**
 * Creates a kalm client that uses the Websocket transport.
 * It will attempt to connect to a server located at the address '0.0.0.0' on port 3938.
 *
 * The manual routine needs to be constructed first in order to get access to the `flush` method.
 */
const { flush, queue } = routines.manual();

const client = connect({
  transport: ws({}),
  port: 3938,
  host: '0.0.0.0',
  routine: queue,
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

  /**
   * In manual mode, written messages await in the queue for an explicit flush.
   */
  flush();
});
