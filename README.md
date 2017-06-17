<h1 align="center">
  <a title="The socket optimizer" href="http://kalm.js.org">
    <img alt="Kalm" width="320px" src="http://res.cloudinary.com/kalm/image/upload/v1487202241/kalm_header.png" />
    <br/><br/>
  </a>
  Kalm
</h1>
<h3 align="center">
  The Socket Manager
  <br/><br/><br/>
</h3>
<br/>

[![Kalm](https://img.shields.io/npm/v/kalm.svg)](https://www.npmjs.com/package/kalm)
[![Node](https://img.shields.io/badge/node->%3D4.0-blue.svg)](https://nodejs.org)
[![Build Status](https://travis-ci.org/kalm/kalm.js.svg?branch=master)](https://travis-ci.org/kalm/kalm.js)
[![Dependencies Status](https://david-dm.org/kalm/kalm.js.svg)](https://david-dm.org/kalm/kalm.js)
[![Gitter](https://img.shields.io/gitter/room/kalm/kalm.svg)](https://gitter.im/kalm/Kalm)

---

- **Easy-to-use syntax** and feature parity for all protocols
- Flexible and extensible, load your own transports and serializers
- **Multiplexing, session stores and packet encryption**
- Can be used between servers or in the **browser**
- Lower resource footprint and over **better throughtput** than plain sockets


## How it works

**Bytes transfered**

Call buffering can reduce payload sizes at the cost of some initial latency. 
This makes a huge difference when you need to send a large number of small packets, such as multiplayer games do. See [Nagle's algorithm](https://en.wikipedia.org/wiki/Nagle's_algorithm).

**Hardware pressure**

Giving profiles to your traffic output creates a more predictable load on the system and on the network. Furthermore, instantiating less network calls reduces the resource required exponantially. This means that your application can now run on less expensive machines!

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)


## Install

```
    npm install kalm
```

## Usage

**Server**

```node
    const Kalm = require('kalm');

    // Listening for incoming UDP transactions on port 6000
    const server = Kalm.listen({
      port: 6000
    });

    server.on('connection', (client) => { 
      // Subscribe to 'user.action' channel
      client.subscribe('user.action', (req) => {
        /*
          req.body       The body of the request
          req.client     The connection handle reference
          req.frame      The details of the network frame
          req.session    The session store for that connection
        */
      });

      // Broadcast to all connections subscribed to the channel 'user.join'
      server.broadcast('user.join', { foo: 'bar' });
    });
    
```

**Client**

```node
    import Kalm from 'kalm';

    // Opens a connection to the server
    // Port, transport and serial settings should match
    const client = Kalm.connect({
      hostname: '0.0.0.0', // Server's IP
      port: 6000 // Server's port
    });

    client.write('user.action', {body: 'This is an object!'}); 
    client.subscribe('user.join', () => { //... });

```

## Options

**Transports** [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)

Name | Module
--- | ---
IPC | `Kalm.transports.IPC`
TCP | `Kalm.transports.TCP`
UDP | `Kalm.transports.UDP`
WebSockets | [kalm-websocket](https://github.com/fed135/kalm-websocket)

**Serializers** [[wiki]](https://github.com/kalm/kalm.js/wiki/Serials)

Name | Module
--- | ---
JSON | `Kalm.serials.JSON`
MSG-PACK | [kalm-msgpack](https://github.com/fed135/kalm-msgpack)
Snappy | [kalm-snappy](https://github.com/fed135/kalm-snappy)
`null` | As-is


**Profiles**

Name | Module | Condition
--- | --- | --- |
dynamic | `Kalm.profiles.dynamic` | Triggers based on buffer size and maximum time range (default) `{ step: 16, maxBytes: 1400 }`
heartbeat | `Kalm.profiles.heartbeat` | Triggers at a fixed time interval `{ step: 16, maxBytes: null }`
threshold | `Kalm.profiles.threshold` | Triggers when buffer reaches a certain size `{ step: null, maxBytes: 1400 }`
manual | `Kalm.profiles.manual` | Need to process queues by hand `{ step: null, maxBytes: null }`


**Loading transports, profiles and serializers**

```node
    // Custom adapter loading example
    const Kalm = require('kalm');
    const ws = require('kalm-websocket');
    const msgpack = require('kalm-msgpack');

    const server = Kalm.listen({
      port: 3000,
      transport: ws,
      serial: msgpack,
      profile: { tick: 5, maxBytes: null } // Triggers every 5ms
    });
```

## Encryption

You can optionaly enable payload encryption by simply putting a String/Number value to the
`secretKey` property of both your client and server. The key has to be the same on both sides.

For better security, the key needs to be at least 16 characters long.

A `null` value (default), means no encryption.


## Testing

**Unit + Smoke tests**

`npm test`

**Benchmarks**

`node tests/benchmarks`


## Logging

Kalm uses [debug](https://github.com/visionmedia/debug)

`export DEBUG=kalm`

## Contribute

Please do! This is an open source project - if you see something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request.

If you have a major change, it would be better to open an issue first so that we can talk about it. 

I am always looking for more maintainers, as well. Get involved. 

## License 

[Apache 2.0](LICENSE) (c) 2017 Frederic Charette

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/kalm/kalm.js/badge.svg?style=beer-square)](https://beerpay.io/kalm/kalm.js)  [![Beerpay](https://beerpay.io/kalm/kalm.js/make-wish.svg?style=flat-square)](https://beerpay.io/kalm/kalm.js?focus=wish)