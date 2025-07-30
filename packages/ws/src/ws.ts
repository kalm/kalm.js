const nativeAPIExists = (typeof WebSocket !== 'undefined');

type WSConfig = {
  cert?: string
  key?: string
  socketTimeout?: number
};

type WSHandle = WebSocket & {
  _queue?: string[]
  _timer?: ReturnType<typeof setTimeout>
  headers?: any
  connection?: any
  _socket?: any
};

export default function ws({ cert, key, socketTimeout = 30000 }: WSConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener;

    async function bind(): Promise<void> {
      if (typeof window !== 'undefined') throw new Error('Cannot create a websocket server from the browser');

      const WSLib = await import('ws');

      if (cert && key) {
        const https = await import('https');
        const server = https.createServer({ key, cert }, req => req.socket.end());
        listener = new WSLib.WebSocketServer({ port: params.port, server });
      }
      else {
        listener = new WSLib.WebSocketServer({ port: params.port });
      }
      listener.on('connection', soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      setTimeout(() => emitter.emit('ready'), 1);
    }

    function send(handle: WSHandle & { _queue: string[] }, payload: RawFrame | string): void {
      if (handle && handle.readyState === 1) handle.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      else handle._queue.push(JSON.stringify(payload));
      resetTimeout(handle);
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle?: WSHandle): WSHandle {
      const protocol: string = (!!cert && !!key) === true ? 'wss' : 'ws';
      const connection: WSHandle = handle || new WebSocket(`${protocol}://${params.host}:${params.port}`);
      connection.binaryType = 'arraybuffer';
      const evtType: string = nativeAPIExists ? 'addEventListener' : 'on';
      connection._queue = [];
      connection._timer = null;
      connection[evtType]('message', (evt) => {
        emitter.emit('frame', { body: JSON.parse(evt.data || evt), payloadBytes: (evt.data || evt).length });
        resetTimeout(connection);
      });
      connection[evtType]('error', err => emitter.emit('error', err));
      connection[evtType]('close', () => emitter.emit('disconnected'));
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

    function remote(handle: WSHandle): Remote {
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
        if (handle.end) handle.end();
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
