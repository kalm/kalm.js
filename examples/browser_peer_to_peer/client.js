const roomPassword = 'some_random_string';

function createPeer(channel) {
  return new Promise((resolve, reject) => {
    let peerListener;
    const peeringClient = kalm.connect({
      label: Math.random() * 1024,
      host: '0.0.0.0',
      port: 8800,
      transport: ws(),
      routine: kalm.routines.realtime(),
    });

    peeringClient.on('connect', () => {
      peeringClient.write('peering', channel);
      peerListener = kalm.listen({ transport: webrtc() });

      peerListener.on('ready', (offer) => {
        peeringClient.write(`${channel}.peering`, offer);
      });

      peeringClient.subscribe(`${channel}.peering`, (offer) => {
        peerListener.transport.negociate({ peer: offer })
          .then((answer) => {
            peeringClient.write(`${channel}.peering`, answer);
          });
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
    connection.subscribe('/', body => console.log(`Got peer message: "${body}"`));
  });
})();