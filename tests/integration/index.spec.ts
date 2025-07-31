import { connect, listen } from '../../packages/kalm/dist/kalm';

import ipc from '../../packages/ipc/dist/ipc.js';
import tcp from '../../packages/tcp/dist/tcp.js';
import udp from '../../packages/udp/dist/udp.js';
import ws from '../../packages/ws/dist/ws.js';

const transports = { ipc, tcp, udp, ws };

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

      // Create a server before each scenario
      beforeEach(() => {
        server = listen({
          transport: soc,
        });
      });

      // Cleanup afterwards
      afterEach((done) => {
        server.stop();
        server = null;
        setTimeout(() => done(), 100);
      });

      /* --- Tests --- */

      it(`should work with ${transport}`, (done) => {
        const payload = { foo: 'bar' };
        server.on('connection', (c) => {
          c.subscribe('test', (data) => {
            expect(data).toEqual(payload);
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

      it(`should handle special characters with ${transport}`, (done) => {
        const payload = { foo: '한자' };
        server.on('connection', (c) => {
          c.subscribe('test', (data) => {
            expect(data).toEqual(payload);
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

      it(`should handle large payloads with ${transport}`, (done) => {
        server.on('connection', (c) => {
          c.subscribe('test.large', (data) => {
            expect(data).toEqual(largePayload);
            done();
          });
        });
        server.on('error', (e) => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', (e) => {
          if (transport === 'udp') {
            expect(e.message).toEqual('UDP Cannot send packets larger than 16384 bytes, tried to send 28715 bytes');
            return done();
          }
          throw new Error(e);
        });
        client.write('test.large', largePayload);
      });

      it('should not trigger for unsubscribed channels', (done) => {
        const payload = { foo: 'bar' };
        server.on('connection', (c) => {
          c.subscribe('test', () => {
            // Throw on purpose
            expect(false).toBe(true);
            done();
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
