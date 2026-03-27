import type { Http3Server } from '@fails-components/webtransport';

type WebTransportConfig = {
  cert: string
  key: string
  socketTimeout?: number
  secret: string
  serverCertificateHashes?: { algorithm: 'sha-256' | string, value: any }[]
};

type WSHandle = {
  socket: WebTransportBidirectionalStream
  _timer?: ReturnType<typeof setTimeout>
  _isActive?: boolean
  _isKilled?: boolean
};

export default function ws({ cert, key, secret, socketTimeout = 30000, serverCertificateHashes = [] }: WebTransportConfig): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: Http3Server;

    async function bind(): Promise<void> {
      if (typeof window !== 'undefined') throw new Error('Cannot create a WebTransport server from the browser');
      if (!cert) throw new Error('Missing cert to create a secure WebTransport server');
      if (!key) throw new Error('Missing key to create a secure WebTransport server');
      if (!key) throw new Error('Missing secret to create a secure WebTransport server');

      const webtransport = await import('@fails-components/webtransport');

      listener = new webtransport.Http3Server({
        port: params.port,
        privKey: key,
        cert,
        secret,
        host: params.host,
        defaultDatagramsReadableMode: 'bytes',
        
      });
      listener.startServer();

      try {
        const sessionStream = await listener.sessionStream('/');
        const sessionReader = sessionStream.getReader();
        sessionReader.closed.catch((e: any) => console.log('session reader closed with error!', e));

        while (!listener['isKilled']) {
          console.log('sessionReader.read() - waiting for session...');
          const { done, value } = await sessionReader.read();
          if (done) {
            console.log('done! break loop.');
            break;
          }

          value.closed.then(() => {
            console.log('Session closed successfully!');
          }).catch((e: any) => {
            console.log('Session closed with error! ' + e);
          });

          value.ready.then(() => {
            console.log('session ready!', value);
            value.createBidirectionalStream().then(bd => emitter.emit('socket', { socket: bd }));
          });
        }
      }
      catch (err) {
        emitter.emit('error', err);
      }

      setTimeout(() => emitter.emit('ready'), 1);
    }

    function send(handle: WSHandle, payload: RawFrame | string): void {
      const writer = handle.socket?.writable.getWriter();
      if (writer) {
        const encoded = (new TextEncoder()).encode(JSON.stringify(payload));
        encoded.forEach((chunk) => {
          writer.write(chunk);
        });
        handle._isActive = true;
      }
    }

    function stop(): void {
      if (listener) {
        listener['isKilled'] = true;
        listener.stopServer();
      }
    }

    async function _addSocketListeners(connection: WSHandle) {
      emitter.emit('connect');
      connection._isActive = true;

      const reader = connection.socket.readable.getReader();

      reader.closed.catch((err: any) => emitter.emit('error', err));

      while (!connection._isKilled) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        console.log('got value!', value);
        const decoded = (new TextDecoder('utf-8')).decode(value, { stream: false });

        // value is a Uint8Array.
        emitter.emit('frame', { body: JSON.parse(decoded), payloadBytes: decoded.length });
        connection._isActive = true;
      }

      emitter.emit('disconnected');
    }

    function connect(handle?: WSHandle): WSHandle {
      const connection: WSHandle = {
        socket: null,
        _isActive: false,
      };

      if (handle && handle.socket) {
        connection.socket = handle.socket;
        _addSocketListeners(connection);
      }
      else {
        const wt = new WebTransport(`https://${params.host}:${params.port}`, { serverCertificateHashes });
        wt.ready.then(() => wt.createBidirectionalStream().then((bd) => {
          connection.socket = bd;
          _addSocketListeners(connection);
        }));
      }

      connection._timer = setInterval(() => checkTimeout(connection), socketTimeout);

      return connection;
    }

    function checkTimeout(handle: WSHandle) {
      if (!handle._isActive) {
        disconnect(handle);
      }
      else {
        handle._isActive = false;
      }
    }

    function remote(/*handle: WSHandle*/): Remote {
      return {
        host: null,
        port: null,
      };
    }

    function disconnect(handle) {
      if (handle) {
        handle._isKilled = true;

        clearInterval(handle._timer);
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
