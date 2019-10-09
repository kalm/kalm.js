/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';

const isBrowser = (typeof WebSocket !== 'undefined');
const WS = isBrowser ? WebSocket : require('ws');

/* Methods -------------------------------------------------------------------*/

function ws({ cert, key, secure }: WSConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: EventEmitter): Socket {
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

    function send(handle: WebSocket, payload: number[]): void {
      if (handle && handle.readyState === 1) {
        handle.send(Buffer.from(payload));
      } else {
        handle['_queue'].push(payload);
      }
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle?: WebSocket): WebSocket {
      const protocol: string = secure === true ? 'wss' : 'ws';
      const connection: WebSocket = handle || new WS(`${protocol}://${params.host}:${params.port}`);
      connection.binaryType = 'arraybuffer';
      const evtType: string = isBrowser ? 'addEventListener' : 'on';
      connection['_queue'] = [];
      connection[evtType]('message', evt => emitter.emit('frame', Buffer.from(evt.data || evt)));
      connection[evtType]('error', err => emitter.emit('error', err));
      connection[evtType]('close', () => emitter.emit('disconnect'));
      connection[evtType]('open', () => {
        connection['_queue'].forEach(payload => send(connection, payload));
        emitter.emit('connect', connection);
      });

      return connection;
    }

    function remote(handle: WebSocket): Remote {
      const h = handle['headers'];
      return {
        host: (
          (h && h['x-forwarded-for'] && h['x-forwarded-for'].split(',')[0]) ||
          (handle['connection'] && handle['connection'].remoteAddress || '0.0.0.0')
        ),
        port: handle['connection'] && handle['connection'].remotePort || 0
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

export default ws;
