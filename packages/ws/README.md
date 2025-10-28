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

A websocket transport for the [Kalm](https://github.com/kalm/kalm.js) framework.

- Detects native Websocket APIs, or fallbacks to [ws](https://github.com/websockets/ws)
- Supports secure connections

## Installing

`npm install @kalm/ws`

## Options

```typescript
{
    /** The certificate file content for a secure socket connection, both this and `key` must be set */
    cert?: string
    /** The key file content for a secure socket connection, both this and `cert` must be set */
    key?: string
    /** Indicates wether a server or client should use wss:// protocol. Will throw an error if set without cert or key on the server */
    secure?: boolean
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout: number
}
```

For more info, refer to the [Kalm Homepage](https://github.com/kalm/kalm.js) 

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2025 Frederic Charette
