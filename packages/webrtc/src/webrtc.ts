/* Requires ------------------------------------------------------------------*/

import Peer from 'simple-peer';

if (!Peer.WEBRTC_SUPPORT) throw new Error('Unsupported environement for WebRTC');

/* Methods -------------------------------------------------------------------*/

function webrtc(config: WebRTCConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let listener;

    function bind(): void {
      listener = new Peer({ initiator: !(config.peers && config.peers.length > 0) });
      listener.on('signal', (signal) => {
        if (['offer', 'anwser'].includes(signal.type)) {
          emitter.emit('ready', signal);
        }
      });
      listener.on('connect', (soc) => emitter.emit('socket', soc));
      listener.on('error', err => emitter.emit('error', err));
      
      if (config.peers) config.peers.forEach(peer => listener.signal(peer));
    }

    function send(handle: any, payload: number[]): void {
      handle.write(Buffer.from(payload));
    }

    function stop(): void {
      if (listener) listener.close();
    }

    function connect(handle: any): any {
      if (handle) {
        handle.on('data', evt => emitter.emit('rawFrame', Buffer.from(evt.data || evt)));
        handle.on('error', err => emitter.emit('error', err));
        handle.on('connect', () => emitter.emit('connect', handle));
        handle.on('close', () => emitter.emit('disconnect'));
      }
      else {
          if (!params.peer) throw new Error('No peer configuration provided in `connect`.');
          if (!listener) throw new Error('No listeners initiated, `listen` needs to be invoked first.');
          listener.signal(params.peer);
      }

      return handle;
    }

    function remote(handle: any): Remote {
      return {
        host: handle,
        port: handle || 0,
      };
    }

    function disconnect(handle) {
      if (handle) handle.destroy();
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

module.exports = webrtc;
