const kalm = require('kalm');
const ws = require('@kalm/ws');
const snappy = require('snappy');

const Client = kalm.connect({
  transport: ws(),
  port: 3938,
  json: false,
  routine: kalm.routines.realtime(),
});

Client.subscribe('foo', (body, frame) => {
  snappy.uncompress(body, (decompressedMessage) => {
    console.log('Server event', decompressedMessage, frame);
  });
});

const payload = {
  foo: 'bar',
  message: 'hello from the client!',
};

Client.write('foo', snappy.compressSync(Buffer.from(JSON.stringify(payload))));
