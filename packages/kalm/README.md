<h1 align="center">
  <a title="The socket optimizer" href="http://kalm.js.org">
    <img alt="Kalm" width="300px" src="https://kalm.js.org/images/kalmv3.png" />
    <br/>
  </a>
  Kalm
</h1>
<h3 align="center">
  The Socket Optimizer
  <br/><br/>
</h3>
<br/>

- **Easy-to-use syntax** unified across protocols
- Flexible and extensible, create your own transports and buffering strategies
- Can be used between servers or in the **browser**
- Lower resource footprint and **better throughput** than plain sockets
- **Zero dependencies** and can be bundled down to ~5kb!


## Performance

<img align="center" alt="perf" src="https://kalm.js.org/images/v8_perf.png" />

The performance gain comes from buffering packets before sending them- eventually sending batches instead of individual packages. The more traffic getting processed, the better the improvement. Many strategies are offered as routines. You can read more about the packet buffering algorithm [here](https://en.wikipedia.org/wiki/Nagle%27s_algorithm)

## Install

Install the core package

`npm install kalm`

Install the transport layer ('tcp' for example)

`npm install @kalm/tcp`

## Usage

**Server**

```javascript
const kalm = require('kalm');
const ws = require('@kalm/ws');

const server = kalm.listen({
  port: 8800,
  transport: ws(),
  routine: kalm.routines.tick({ hz: 5 }), // Sends packets at a frequency of 5 Hz (200ms)
  host: '0.0.0.0',
});

server.on('connection', (client) => {
  client.subscribe('channel1', (body, context) => {
    // When receiving messages from this client on "channel1"
    console.log(body) //
    console.log(context) //
  });

  // Sends a message to all clients on "channel2"
  server.broadcast('channel2', 'some message');
});
```

**Client**

```javascript
const kalm = require('kalm');
const ws = require('@kalm/ws');

const client = kalm.connect({
  host: '0.0.0.0',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.realtime(),
  // socket: new WebSocket(...), // You can also pass a socket object, which unlocks compatibility with many other libraries, like https://github.com/joewalnes/reconnecting-websocket
});

client.on('connect', () => {
  client.subscribe('channel1', (body, context) => {
    // When receiving messages from the server on "channel1"
    console.log(body); // 
    console.log(context); //
  });

  // Sends a message to the server on "channel2"
  client.write('channel2', 'hello world');
});

```
To see working implementations, check out our [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder.

- [Peer to peer with WebRTC](https://github.com/kalm/kalm.js/tree/master/examples/browser_peer_to_peer)
- [Distributed Pub-Sub](https://github.com/kalm/kalm.js/tree/master/examples/distributed_pub_sub)
- [Binary packet compression](https://github.com/kalm/kalm.js/tree/master/examples/binary_compression)
- [Basic Typescript usage](https://github.com/kalm/kalm.js/tree/master/examples/typescript_websocket)

## Documentation

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
  - [@kalm/ipc](https://www.npmjs.com/package/@kalm/ipc)
  - [@kalm/tcp](https://www.npmjs.com/package/@kalm/tcp)
  - [@kalm/udp](https://www.npmjs.com/package/@kalm/udp)
  - [@kalm/ws](https://www.npmjs.com/package/@kalm/ws)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)
  - realtime
  - dynamic
  - tick

## Logging

Kalm uses the `NODE_DEBUG` environment variable. Just include `kalm` in your value.

Example: 

`NODE_DEBUG=net,kalm node myApp.js`

## Events

Kalm **servers** offers events to track when packets are processed by routines or when a raw frame is received.

| Server Event | Payload | Description |
| --- | --- | --- |
| `error` | Error | (server, client) Emits on errors. |
| `ready` | void | (server) Indicates that the server is now actively listening for new connections |
| `connection` | [Client](./types.d.ts#L90) | (server) Indicates that a client has successfully connected |

Kalm **clients** offers events to track when packets are processed by routines or when a raw frame is received.

| Client Event | Payload | Description |
| --- | --- | --- |
| `error` | Error | (server, client) Emits on errors. |
| `connect` | void | (client) Indicates that a client has successfully connected |
| `disconnect` | void | (client) Indicates that a client has disconnected |
| `frame` | { body: Partial<[RawFrame](./types.d.ts#L189)>, payloadBytes: number } | (client) Triggered when receiving payloads, can be used to intercept messages from non-kalm counterparts. |

## Testing

`npm test`


`npm run bench`


## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

<a href="https://github.com/kalm/kalm.js/graphs/contributors"><img src="https://opencollective.com/kalm/contributors.svg?width=890&button=false" /></a>

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) 2025 Frederic Charette
