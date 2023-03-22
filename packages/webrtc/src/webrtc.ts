import Peer from 'simple-peer';

const isNode = (typeof process !== 'undefined');
if (!Peer.WEBRTC_SUPPORT && !(isNode && process.env.JEST_WORKER_ID)) throw new Error('Unsupported environement for WebRTC');

type WebRTCConfig = {
  peers?: Peer[]
}

function webrtc(config: WebRTCConfig = {}): KalmTransport {
  return function socket(params: ClientConfig, emitter: NodeJS.EventEmitter): Socket {
    let activeNode;
    let passiveNode;

    function createNode(isInitiator) {
      const node = new Peer({ initiator: isInitiator, trickle: false });
      node.on('error', err => emitter.emit('error', err));
      node.on('connect', () => emitter.emit('socket', node));
      return node;
    }

    function negociate(event: any) {
      return new Promise(resolve => {
        if (!event.peer) throw new Error('No peer configuration provided in `connect`.');
        if (event.peer.type === 'answer') {
          activeNode.signal(event.peer);
        } else {
          passiveNode.on('signal', signal => {
            if (signal.type === 'answer') resolve(signal);
          });

          passiveNode.signal(event.peer);
        }
      });
    }

    function bind(): void {
      activeNode = createNode(true);
      passiveNode = createNode(false);
      activeNode.on('signal', signal => {
        if (signal.type === 'offer') emitter.emit('ready', signal);
      });

      if (config.peers) config.peers.forEach(peer => negociate({ peer }));
    }

    function send(handle: any, payload: RawFrame): void {
      handle.send(JSON.stringify(payload));
    }

    function stop(): void {
      if (activeNode) activeNode.destroy();
    }

    function connect(handle: any): any {
      if (handle) {
        emitter.emit('connect', handle);
        handle.on('data', evt => emitter.emit('frame', JSON.parse(evt.data || evt), (evt.data || evt).length));
        handle.on('close', () => emitter.emit('disconnect'));
      } else {
        throw new Error('Do not use `connect` for webrtc, use `Client.transport.negociate()` instead.');
      }

      return handle;
    }

    function remote(handle: any): Remote {
      return handle || { host: null, port: null };
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
      negociate,
    };
  };
}

// Ensures support for modules and requires
module.exports = webrtc;
