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

An IPC transport for the [Kalm](https://github.com/kalm/kalm.js) framework.

- Send messages over file handles (IPC) to other processes with ease
- Supports Windows, Mac and Linux 

## Installing

`npm install @kalm/ipc`

## Options

```
{
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout: 30000,
    /** The prefix to use for file handler location. Final handler is ${path + port}
        Ex: '/tmp/app.socket-9001' for Mac and Linux or 'C:\Windows\Temp\app.socket-9001' on Windows
    */
    path: '/tmp/app.socket-'
}
```

For more info, refer to the [Kalm Homepage](https://github.com/kalm/kalm.js) 

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm.js/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2025 Frederic Charette
