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
[![Build Status](https://travis-ci.org/kalm/kalm.js.svg?branch=master)](https://travis-ci.org/kalm/kalm.js)

---

- **Easy-to-use syntax** unified across protocols
- Flexible and extensible, load your own transports and routines
- Can be used between servers or in the **browser**
- Lower resource footprint and **better throughtput** than plain sockets
- **Zero dependencies** and can be bundled down to ~5kb!


## Performance

<img align="center" alt="perf" src="https://kalm.js.org/images/kalmv3chart.png" />

The performance gain comes from buffering packets before sending them- eventually sending batches instead of individual packages. The more traffic getting processed, the better the improvement. Many strategies are offered as routines. You can read more about the packet buffering algorithm [here](https://en.wikipedia.org/wiki/Nagle%27s_algorithm)

## Install

Install the core package

`npm install kalm`

Install the transport layer ('tcp' for example)

`npm install @kalm/tcp`

## Usage

**Server**

```javascript
const Server = kalm.listen({
  port: 8800,
  transport: ws(),
  routine: kalm.routines.tick(5), // Hz
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

See the [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder for great real-world examples!

## Documentation

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)

## Logging

Kalm uses the `NODE_DEBUG` environment variable. Just include `kalm` in your value.

Example: 

`NODE_DEBUG=net,kalm node myApp.js`

## Testing

`npm test`


`npm run bench`

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2019 Frederic Charette
