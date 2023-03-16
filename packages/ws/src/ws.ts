const isBrowser = (typeof WebSocket !== 'undefined');
const WS = isBrowser ? WebSocket : require('ws');

type WSConfig = {
  cert?: string
  key?: string
  agent?: any
  socketTimeout?: number
}

export function ws({ cert, key, agent, socketTimeout = 30000 }: WSConfig = {}): KalmTransport<WebSocket> {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket<WebSocket> {
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
      resetTimeout(handle);
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle?: WebSocket): WebSocket {
      const protocol: string = (!!cert && !!key) === true ? 'wss' : 'ws';
      const connection: WebSocket & { _queue: string[], _timer: ReturnType<typeof setTimeout> } = handle || new WS(`${protocol}://${params.host}:${params.port}`, { ...(agent ? {agent} : {})});
      connection.binaryType = 'arraybuffer';
      const evtType: string = isBrowser ? 'addEventListener' : 'on';
      connection._queue = [];
      connection._timer = null;
      connection[evtType]('message', evt => {
        emitter.emit('frame', JSON.parse(evt.data || evt), (evt.data || evt).length);
        resetTimeout(connection);
      });
      connection[evtType]('error', err => emitter.emit('error', err));
      connection[evtType]('close', () => emitter.emit('disconnect'));
      connection[evtType]('open', () => {
        emitter.emit('connect', connection);
        connection._queue.forEach(payload => send(connection, payload));

        resetTimeout(connection);
      });

      return connection;
    }

    function resetTimeout(handle) {
      clearTimeout(handle._timer);
      handle._timer = setTimeout(() => {
        disconnect(handle);
      }, socketTimeout);
    }

    function remote(handle: WebSocket & { headers: any, connection: any, _socket: any }): Remote {
      const h = handle && handle.headers || {};
      const headerHost = h && h['x-forwarded-for'] && h['x-forwarded-for'].split(',')[0];
      const remoteHost = handle?.connection?.remoteAddress;
      const socketHost = handle?._socket?.server?._connectionKey;
      return {
        host: headerHost || remoteHost || socketHost || null,
        port: handle?.connection?.remotePort || null,
      };
    }

    function disconnect(handle) {
      if (handle) {
        clearTimeout(handle._timer);
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
