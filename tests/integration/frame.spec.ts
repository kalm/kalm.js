/* Requires ------------------------------------------------------------------ */

import { connect, listen } from '../../packages/kalm/dist/kalm';
import ipc from '../../packages/ipc/dist/ipc';

/* Suite -------------------------------------------------------------------- */

describe('Frame', () => {
  let server;

  /* --- Setup --- */

  // Create a server before each scenario
  beforeEach(() => {
    server = listen({
      transport: ipc(),
    });
  });

  // Cleanup afterwards
  afterEach((done) => {
    server.stop();
    server = null;
    setTimeout(() => done(), 100);
  });

  it('Should have a well structured frame reference', (done) => {
    const payload = { foo: 'bar' };
    server.addEventListener('connection', (c) => {
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
    server.addEventListener('error', (e) => {
      throw new Error(e);
    });

    const client = connect({ transport: ipc() });
    client.addEventListener('error', (e) => {
      throw new Error(e);
    });
    client.write('test', payload);
  });
});
