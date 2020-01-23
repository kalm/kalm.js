const kalm = require('kalm');
const ws = require('@kalm/ws');
const webrtc = require('@kalm/webrtc');

const roomPassword = 'some_random_string';

function createPeer(channel) {
  return new Promise((resolve, reject) => {
    let peerListener;
    let webrtcInstance = webrtc();
    const peeringClient = kalm.connect({
      label: randomBytes(4).toString('hex'),
      host: '0.0.0.0',
      port: 8800,
      transport: ws(),
      routine: kalm.routines.realtime(),
    });

    peeringClient.on('connect', () => {
      peeringClient.write('peering', channel);
      peerListener = listen({ transport: webrtcInstance });

      peerListener.on('ready', (offer) => {
        peeringClient.write(`${channel}.peering`, offer);
      });

      peeringClient.subscribe(`${channel}.peering`, (answer) => {
        kalm.connect({ transport: webrtcInstance, peer: answer });
      });

      resolve(peerListener);
    });

    peeringClient.on('error', err => reject(err));
  });
}

// Since we don't have top-level async yet
(async () => {
  const client = await createPeer(roomPassword);
  client.on('connection', (connection) => {
    console.log('new connection', connection);
    client.broadcast('/', 'new peer');
    connection.subscribe('/', body => console.log('GOT peer message', body));
  });
})();
