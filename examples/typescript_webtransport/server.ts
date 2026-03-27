import { listen, routines } from 'kalm';
import webtransport from '@kalm/webtransport';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certificate = {
    private: readFileSync(path.join(__dirname, "./cert/localhost.key")),
    cert: readFileSync(path.join(__dirname, "./cert/localhost.crt")),
};

/**
 * Creates a kalm server that uses the WebTransport protocol.
 * It is bound to local IP 127.0.0.1 and listens on port 3938.
 *
 * The tick routine will emit messages to clients at a frequency no higher than 5hz, or no shorter than 20ms
 *
 * This is a common setup for relaying information to multiple connected clients that all send information rapidly.
 */
const provider = listen({
  transport: webtransport({
    secret: 'my-secret',
    cert: certificate?.cert,
    key: certificate?.private
  }),
  port: 3938,
  host: '0.0.0.0',
  routine: routines.tick({ hz: 5 }),
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
  client.subscribe('foo', (body: MyCustomPayload, context) => {
    /**
     * When we receive a message on the foo channel, we also receive information about the frame and context.
     *
     * body: { message: "hello world!" }
     * context: {
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
    console.log('Client event', body, context);
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
