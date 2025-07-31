import { connect, routines } from 'kalm';
import ws from '@kalm/ws';
import { compressSync, uncompress } from 'snappy';

/**
 * Creates a kalm client that uses the Websocket transport.
 * It will attempt to connect to a server located at the address '0.0.0.0' on port 3938.
 *
 * The realtime routine will emit messages as soon as possible. While this is ideal in a few scenarios, for instance when the client does not send a lot of events,
 * it does not leverage the benefits of buffering and may cause slowdowns if many messages are sent rapidly.
 *
 * To ensure that the message sent is not coerced into JSON, we must pass the `json:false` parameter.
 */
const client = connect({
  transport: ws({}),
  json: false,
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
  client.subscribe('foo', (body: Buffer, context) => {
    /**
     * When we receive a message on the foo channel, we also receive information about the frame and context.
     * We'll need to decompress the buffer to read it.
     *
     * body: <Buffer>
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
    uncompress(body).then((decompressedMessage) => {
      console.log('Server event', JSON.parse(decompressedMessage.toString()) as MyCustomPayload, context);
    });
  });

  /**
   * To send messages from the client to the server, simply `write` to the desired channel.
   */
  client.write('foo', compressSync(Buffer.from(JSON.stringify({ message: 'hello world!' }))));
});
