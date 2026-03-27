import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { connect, listen } from '../../packages/kalm/dist/kalm.js';

import ipc from '../../packages/ipc/dist/ipc.js';
import tcp from '../../packages/tcp/dist/tcp.js';
import udp from '../../packages/udp/dist/udp.js';
import ws from '../../packages/ws/dist/ws.js';
import webtransport from '../../packages/ws/dist/ws.js';

const transports = { ipc, tcp, udp, ws, webtransport };

const largePayload: { foo: string }[] = [];
while (largePayload.length < 2048) {
  largePayload.push({ foo: 'bar' });
}

describe('Integration tests', () => {
  ['ipc', 'tcp', 'udp', 'ws'].forEach((transport) => {
    describe(`Testing ${transport} transport`, () => {
      let server;
      const soc = transports[transport]();

      /* --- Setup --- */

      beforeEach(() => {
        server = listen({
          transport: soc,
        });
      });

      afterEach((_t, done) => {
        server.stop();
        server = null;
        setTimeout(() => done(), 100);
      });

      /* --- Tests --- */

      it(`should work with ${transport}`, (_t, done) => {
        const payload = { foo: 'bar' };
        server.on('connection', (c) => {
          c.subscribe('test', (data) => {
            assert.deepStrictEqual(data, payload);
            done();
          });
        });
        server.on('error', (e) => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', (e) => {
          throw new Error(e);
        });
        client.write('test', payload);
      });

      it(`should handle special characters with ${transport}`, (_t, done) => {
        const payload = { foo: '한자' };
        server.on('connection', (c) => {
          c.subscribe('test', (data) => {
            assert.deepStrictEqual(data, payload);
            done();
          });
        });
        server.on('error', (e) => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', (e) => {
          throw new Error(e);
        });
        client.write('test', payload);
      });

      it(`should handle large payloads with ${transport}`, (_t, done) => {
        server.on('connection', (c) => {
          c.subscribe('test.large', (data) => {
            assert.deepStrictEqual(data, largePayload);
            done();
          });
        });
        server.on('error', (e) => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', (e) => {
          if (transport === 'udp') {
            assert.strictEqual(e.message, 'UDP Cannot send packets larger than 16384 bytes, tried to send 28715 bytes');
            return done();
          }
          throw new Error(e);
        });
        client.write('test.large', largePayload);
      });

      it('should not trigger for unsubscribed channels', (_t, done) => {
        const payload = { foo: 'bar' };
        server.on('connection', (c) => {
          c.subscribe('test', () => {
            assert.fail('should not be called');
          });

          c.unsubscribe('test');
        });
        server.on('error', (e) => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', (e) => {
          throw new Error(e);
        });
        setTimeout(() => client.write('test', payload), 100);
        setTimeout(() => done(), 200);
      });
    });
  });
});
