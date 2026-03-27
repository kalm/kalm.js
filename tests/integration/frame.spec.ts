/* Requires ------------------------------------------------------------------ */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { connect, listen } from '../../packages/kalm/dist/kalm.js';
import ipc from '../../packages/ipc/dist/ipc.js';

/* Suite -------------------------------------------------------------------- */

describe('Frame', () => {
  let server;

  /* --- Setup --- */

  beforeEach(() => {
    server = listen({
      transport: ipc(),
    });
  });

  afterEach((_t, done) => {
    server.stop();
    server = null;
    setTimeout(() => done(), 100);
  });

  it('Should have a well structured frame reference', (_t, done) => {
    const payload = { foo: 'bar' };
    server.on('connection', (c) => {
      c.subscribe('test', (data, meta) => {
        assert.deepStrictEqual(meta, {
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
    server.on('error', (e) => {
      throw new Error(e);
    });

    const client = connect({ transport: ipc() });
    client.on('error', (e) => {
      throw new Error(e);
    });
    client.write('test', payload);
  });
});
