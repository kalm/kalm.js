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

[![Kalm](https://img.shields.io/npm/v/kalm.svg)](https://www.npmjs.com/package/kalm)
[![Build Status](https://github.com/kalm/kalm.js/workflows/master-status/badge.svg)](https://github.com/kalm/kalm.js/actions?query=workflow%3A+master-status)
[![Financial Contributors on Open Collective](https://opencollective.com/kalm/all/badge.svg?label=financial+contributors)](https://opencollective.com/kalm) 
---

- **Easy-to-use syntax** unified across protocols
- Flexible and extensible, load your own transports and routines
- Can be used between servers or in the **browser**
- Lower resource footprint and **better throughtput** than plain sockets
- **Zero dependencies** and can be bundled down to ~5kb!


## Performance

<img align="center" alt="perf" src="https://kalm.js.org/images/kalmv3_3chart.png" />

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

const Server = kalm.listen({
  port: 8800,
  transport: ws(),
  routine: kalm.routines.tick({ hz: 5 }), // Sends packets at a frequency of 5 Hz (200ms)
  host: '0.0.0.0',
});
```

**Client**

```javascript
const kalm = require('kalm');
const ws = require('@kalm/ws');

const Client = kalm.connect({
  host: '0.0.0.0',
  port: 8800,
  transport: ws(),
  routine: kalm.routines.realtime(),
});
```
To see working implementations, check out our [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder.

- [Peer to peer](https://github.com/kalm/kalm.js/tree/master/examples/browser_peer_to_peer)
- [Chat via websockets](https://github.com/kalm/kalm.js/tree/master/examples/chat_websocket)
- [Distributed Pub-Sub](https://github.com/kalm/kalm.js/tree/master/examples/distributed_pub_sub)
- [Packet compressing](https://github.com/kalm/kalm.js/tree/master/examples/compression)
- [Typescript usage](https://github.com/kalm/kalm.js/tree/master/examples/typescript)

## Documentation

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)

## Logging

Kalm uses the `NODE_DEBUG` environment variable. Just include `kalm` in your value.

Example: 

`NODE_DEBUG=net,kalm node myApp.js`

## Events

Kalm offers events to track when packets are processed by routines or when a raw frame is received.

| Event | Payload | Description |
| --- | --- | --- |
| `error` | Error | (provider, client) Emits on errors. |
| `ready` | void | (provider) Indicates that the provider is now actively listeneing for new connections |
| `connection` | [Client](./types.d.ts#L35) | (provider) Indicates that a client has successfuly connected |
| `connect` | [Client](./types.d.ts#L35) | (client) Indicates that a client has successfuly connected |
| `disconnect` | void | (client) Indicates that a client has disconnected |
| `frame` | [RawFrame](./types.d.ts#L111) | (client) Triggered when recieving a parsed full frame. |
| `<channel>.queueAdd` | ```{ frameId: number, packets: number}``` | (client) Indicates that a packet was queued to a frame. |
| `<channel>.queueRun` | ```{ frameId: number, packets: number}``` | (client) Indicates that a frame is being sent. |

## Testing

`npm test`


`npm run bench`

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

<a href="https://github.com/kalm/kalm.js/graphs/contributors"><img src="https://opencollective.com/kalm/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/kalm/contribute)]

#### Individuals

<a href="https://opencollective.com/kalm"><img src="https://opencollective.com/kalm/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/kalm/contribute)]

<a href="https://opencollective.com/kalm/organization/0/website"><img src="https://opencollective.com/kalm/organization/0/avatar.svg"></a>

## License 

[Apache 2.0](LICENSE) (c) 2020 Frederic Charette
