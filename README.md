<h1 align="center">
  <a title="The socket optimizer" href="http://kalm.js.org">
    <img alt="Kalm" width="320px" src="https://kalm.js.org/images/kalm-logo.png" />
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
[![Build Status](https://travis-ci.org/kalm/kalm.js.svg?branch=master)](https://travis-ci.org/kalm/kalm.js)
[![Dependencies Status](https://david-dm.org/kalm/kalm.js.svg)](https://david-dm.org/kalm/kalm.js)

---

- **Easy-to-use syntax** unified across protocols
- Flexible and extensible, load your own transports and serializers
- Can be used between servers or in the **browser**
- Lower resource footprint and **better throughtput** than plain sockets
- **Zero dependencies**


## Performance

<img align="center" alt="performance" width="320px" src="https://kalm.js.org/images/kalm-logo.png" />

## Install

```
    npm install kalm
```

## How it works

[[Read more]](https://github.com/kalm/kalm.js/wiki/How-it-works)

## Usage

See the [examples](https://github.com/kalm/kalm.js/tree/master/examples) folder.

## Options

- Transports [[wiki]](https://github.com/kalm/kalm.js/wiki/Transports)
- Formats [[wiki]](https://github.com/kalm/kalm.js/wiki/Formats)
- Routines  [[wiki]](https://github.com/kalm/kalm.js/wiki/Routines)

## Logging

Kalm uses the built-in `NODE_DEBUG` flag. Just include `kalm` in your value.

## Testing

**Unit + Smoke tests**

`npm test`

**Benchmarks**

`node tests/benchmarks`

## Contribute

The proverbial door is wide open - if you see something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2019 Frederic Charette
