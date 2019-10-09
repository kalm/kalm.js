const kalm = require('kalm');
const ws = require('@kalm/ws');
const snappy = require('snappy');

const provider = kalm.listen({
  label: 'internal',
  transport: ws(),
  port: 3000,
  json: false,
  routine: kalm.routines.realtime(),
  host: '0.0.0.0', // Apply local ip
});

provider.on('connection', (client) => {
  client.subscribe('foo', (body, frame) => {
    snappy.uncompress(body, (decompressedMessage) => {
      console.log('Client event', decompressedMessage, frame);
    });
  });

  const payload = {
    foo: 'bar',
    message: 'hello from the server!',
  };
  
  client.write('foo', snappy.compressSync(Buffer.from(JSON.stringify(payload))));
});
