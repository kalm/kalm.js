/* Requires ------------------------------------------------------------------*/

const isBrowser = (typeof WebSocket !== 'undefined');
const WS = isBrowser ? WebSocket : require('ws');

/* Methods -------------------------------------------------------------------*/

function ws({ cert, key, secure }: WSConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener;

    function bind(): void {
      if (cert && key) {
        const server = require('https').createServer({ key, cert }, req => req.socket.end());
        listener = new WS.Server({ port: params.port, server });
      } else {
        listener = new WS.Server({ port: params.port });
      }
      listener.on('connection', soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      emitter.emit('ready');
    }

    function send(handle: WebSocket & { _queue: string[] }, payload: RawFrame | string): void {
      if (handle && handle.readyState === 1) handle.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      else handle._queue.push(JSON.stringify(payload));
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle?: WebSocket): WebSocket {
      const protocol: string = secure === true ? 'wss' : 'ws';
      const connection: WebSocket & { _queue: string[] } = handle || new WS(`${protocol}://${params.host}:${params.port}`);
      connection.binaryType = 'arraybuffer';
      const evtType: string = isBrowser ? 'addEventListener' : 'on';
      connection._queue = [];
      connection[evtType]('message', evt => emitter.emit('frame', JSON.parse(evt.data || evt), (evt.data || evt).length));
      connection[evtType]('error', err => emitter.emit('error', err));
      connection[evtType]('close', () => emitter.emit('disconnect'));
      connection[evtType]('open', () => {
        emitter.emit('connect', connection);
        connection._queue.forEach(payload => send(connection, payload));
      });

      return connection;
    }

    function remote(handle: WebSocket & { headers: any, connection: any }): Remote {
      const h = handle && handle.headers || {};
      return {
        host: (
          (h && h['x-forwarded-for'] && h['x-forwarded-for'].split(',')[0])
          || (handle && handle.connection && handle.connection.remoteAddress || null)
        ),
        port: handle && handle.connection && handle.connection.remotePort || null,
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

module.exports = ws;
