/* Requires ------------------------------------------------------------------*/

const isBrowser = (typeof WebTransport !== 'undefined');
const nodeInstance = !isBrowser && require('net').createQuicStream;

/* Methods -------------------------------------------------------------------*/

function ws({ secure, path }: WSConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener;

    function bind(): void {
      const url = `${secure ? 'https' : 'http'}://${params.host}:${params.port}${path || '/'}`;
      listener = isBrowser ? new WebTransport(url) : nodeInstance(url);
      listener.on('connection', soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      emitter.emit('ready');
    }

    function send(handle: Socket & { _queue: string[] }, payload: RawFrame | string): void {
      handle.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle?: WebSocket): WebSocket {
      const url = `${secure ? 'https' : 'http'}://${params.host}:${params.port}${path || '/'}`;
      const connection = isBrowser ? new WebTransport(url) : nodeInstance(url);
      const evtType: string = isBrowser ? 'addEventListener' : 'on';
      connection[evtType]('message', evt => emitter.emit('frame', evt.data));
      connection[evtType]('error', err => emitter.emit('error', err));
      connection[evtType]('close', () => emitter.emit('disconnect'));
      connection[evtType]('open', () => emitter.emit('connect', connection));

      return connection;
    }

    function remote(handle: Socket): Remote {
      return {
        host: handle?.connection?.remoteAddress || null,
        port: handle?.connection?.remotePort || null,
      };
    }

    function disconnect(handle) {
      if (handle) {
        handle.end();
        handle.close();
      }
    }

    return {
      bind,
      connect,
      disconnect,
      remote,
      send,
      stop,
    };
  };
}

/* Exports -------------------------------------------------------------------*/

module.exports = quic;
