import net from 'net';

interface TCPSocket extends net.Socket {
  _peername: {
    address: string
    port: number
  }
}

interface TCPConfig {
  socketTimeout?: number
}

export default function tcp({ socketTimeout = 30000 }: TCPConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: net.Server;

    function bind(): void {
      listener = net.createServer(soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      listener.listen(params.port, () => emitter.emit('ready'));
    }

    function remote(handle: TCPSocket): Remote {
      return {
        host: handle?.remoteAddress || handle?._peername?.address || null,
        port: handle?.remotePort || handle?._peername?.port || null,
      };
    }

    function disconnect(handle: net.Socket): void {
      if (handle) {
        handle.end();
        handle.destroy();
      }
    }

    function connect(handle: TCPSocket): TCPSocket {
      const connection: net.Socket = handle || net.connect(params.port, params.host);
      let buffer = '';
      connection.on('data', (req) => {
        buffer += req.toString();
        const chunks = buffer.split('\n\n');
        if (buffer.substring(buffer.length - 2) !== '\n\n') {
          buffer = chunks[chunks.length - 1];
          chunks.pop();
        }
        else {
          buffer = '';
        }

        for (let i = 0; i < chunks.length; i++) {
          if (chunks[i] !== '') emitter.emit('frame', { body: JSON.parse(chunks[i]), payloadBytes: req.length });
        }
      });
      connection.on('error', err => emitter.emit('error', err));
      connection.on('connect', () => emitter.emit('connect', connection));
      connection.on('close', () => emitter.emit('disconnected'));
      connection.setTimeout(socketTimeout, () => disconnect(handle));
      return connection as TCPSocket;
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function send(handle: net.Socket, payload: RawFrame): void {
      if (handle) handle.write(`${JSON.stringify(payload)}\n\n`);
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
