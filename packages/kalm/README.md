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

The performance gain comes from buffering packets before sending them- eventually sending batches instead of individual packages. The more traffic getting processed, the better the improvement. You can read more about the algorithm [here](https://en.wikipedia.org/wiki/Nagle%27s_algorithm)

## Install

Install the core package

`npm install kalm`

Install the transport layer ('tcp' for example)

`npm install @kalm/tcp`

## Build

`npm run build`

## Documentation

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)

## Usage

See the [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder.

## Logging

Kalm uses the standard `NODE_DEBUG` environment variable. Just include `kalm` in your value.

## Testing

`npm test`


`npm run bench`

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2019 Frederic Charette
