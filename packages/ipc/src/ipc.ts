import net from 'node:net';
import path from 'node:path';

interface IPCSocket extends net.Socket {
  server?: {
    _connectionKey: string
  }
  _server?: {
    _pipeName: string
  }
  _handle?: {
    fd: number
  }
}

type IPCConfig = {
  socketTimeout?: number
  path?: string
};

function isValidPathSyntax(filePath) {
  try {
    path.parse(filePath);
    return true;
  }
  catch (e) {
    return e;
  }
}

export default function ipc({ socketTimeout = 30000, path = '/tmp/app.socket-' }: IPCConfig = {}): KalmTransport {
  if (typeof window !== 'undefined') throw new Error('Cannot use IPC from the browser');

  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener: net.Server;

    if (isValidPathSyntax(path + params.port) !== true) throw new Error(`Invalid IPC location, path is not resolvable: ${path + params.port}`);

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

    function connect(handle: IPCSocket): IPCSocket {
      const connection: net.Socket = handle || net.connect(`${path}${params.port}`);
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
      connection.on('connect', () => emitter.emit('connect'));
      connection.on('close', () => emitter.emit('disconnected'));
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
