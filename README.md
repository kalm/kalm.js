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
- Flexible and extensible, load your own transports and serializers
- Can be used between servers or in the **browser**
- Lower resource footprint and **better throughtput** than plain sockets
- **Zero dependencies**


## Performance

<img align="center" alt="perf" src="https://kalm.js.org/images/kalmv3chart.png" />

## Install

Install the core package

`npm install kalm`

Install the transport layer ('tcp' for example)

`npm install @kalm/tcp`

## How it works

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

## Usage

See the [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder.

## Options

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)

## Logging

Kalm uses the built-in `NODE_DEBUG` flag. Just include `kalm` in your value.

## Testing

**Unit + Smoke tests**

`npm test`

**Benchmarks**

`npm run bench`

## Contribute

The proverbial door is wide open - if you see something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2019 Frederic Charette
