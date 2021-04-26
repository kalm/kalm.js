/* Requires ------------------------------------------------------------------*/

import { connect, listen } from '../../packages/kalm/bin/kalm';
import ipc from '../../packages/ipc/bin/ipc';

/* Suite --------------------------------------------------------------------*/

describe('Frame', () => {
  let server;

  /* --- Setup ---*/

  // Create a server before each scenario
  beforeEach(() => {
    server = listen({
      transport: ipc(),
    });
  });

  // Cleanup afterwards
  afterEach(done => {
    server.stop();
    server = null;
    setTimeout(() => done(), 100);
  });

  it('Should have a well structured frame reference', done => {
    const payload = { foo: 'bar' };
    server.on('connection', c => {
      c.subscribe('test', (data, meta) => {
        expect(meta).toEqual({
          client: c,
          frame: {
            channel: 'test',
            id: 0,
            messageIndex: 0,
            payloadBytes: 51,
            payloadMessages: 1,
          },
        });
        done();
      });
    });
    server.on('error', e => {
      throw new Error(e);
    });

    const client = connect({ transport: ipc() });
    client.on('error', e => {
      throw new Error(e);
    });
    client.write('test', payload);
  });
});
