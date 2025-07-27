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

[![Kalm](https://img.shields.io/npm/v/kalm.svg)](https://www.npmjs.com/package/@kalm/udp)
[![Build Status](https://github.com/kalm/kalm.js/workflows/master-status/badge.svg)](https://github.com/kalm/kalm.js/actions?query=workflow%3A+master-status)
[![Financial Contributors on Open Collective](https://opencollective.com/kalm/all/badge.svg?label=financial+contributors)](https://opencollective.com/kalm)
[![Join the chat at https://gitter.im/KALM/home](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/KALM/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A UDP transport for the [Kalm](https://github.com/kalm/kalm.js) framework.

- Use fire-and-forget type messaging with the conveinience of stateful interfaces
- Supports ipv4 and ipv6 addresses
- Adds timeouts for recycling instances


## Installing

`npm install @kalm/udp`

## Options

```typescript
{
    /** The udp socket family (default: udp4) */
    type?: 'udp4' | 'udp6'
    /** The ip address that shows up when calling `local()` (default: '0.0.0.0') */
    localAddr?: string
    /** UDP reuse Address seting (default: false) */
    reuseAddr?: boolean
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout?: number
}
```

For more info, refer to the [Kalm Homepage](https://github.com/kalm/kalm.js) 

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2025 Frederic Charette
