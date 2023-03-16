import net from 'net';

interface IPCSocket extends net.Socket {
  server: {
    _connectionKey: string
  }
  _server: {
    _pipeName: string
  }
  _handle: {
    fd: number
  }
}

export function ipc({ socketTimeout = 30000, path = '/tmp/app.socket-' }: IPCConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: net.Server;

    function bind(): void {
      listener = net.createServer(soc => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      listener.listen(path + params.port, () => emitter.emit('ready'));
    }

    function remote(handle: IPCSocket): Remote {
      return {
        host: handle?._server?._pipeName || handle?.server?._connectionKey || null,
        port: handle?._handle?.fd || null,
      };
    }

    function disconnect(handle): void {
      if (handle) {
        handle.end();
        handle.destroy();
      }
    }

    function connect(handle: net.Socket): net.Socket {
      const connection: net.Socket = handle || net.connect(`${path}${params.port}`);
      let buffer = '';
      connection.on('data', req => {
        buffer += req.toString();
        const chunks = buffer.split('\n\n');
        if (buffer.substring(buffer.length - 2) !== '\n\n') {
          buffer = chunks[chunks.length - 1];
          chunks.pop();
        } else {
          buffer = '';
        }

        for (let i = 0; i < chunks.length; i++) {
          if (chunks[i] !== '') emitter.emit('frame', JSON.parse(chunks[i]), req.length);
        }
      });
      connection.on('error', err => emitter.emit('error', err));
      connection.on('connect', () => emitter.emit('connect', connection));
      connection.on('close', () => emitter.emit('disconnect'));
      connection.setTimeout(socketTimeout, () => disconnect(handle));
      return connection;
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
