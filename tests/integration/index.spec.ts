/**
 * Kalm integration test suite
 */


/* Requires ------------------------------------------------------------------*/

import { connect, listen } from '../../packages/kalm/src/kalm';

/* Suite --------------------------------------------------------------------*/

describe('Integration tests', () => {
  ['ipc', 'tcp', 'udp', 'ws'].forEach(transport => {
    describe(`Testing ${transport} transport`, () => {
      let server;
      const soc = require(`../../packages/${transport}/src/${transport}`)(); /* eslint-disable-line */

      /* --- Setup ---*/

      // Create a server before each scenario
      beforeEach(() => {
        server = listen({
          transport: soc,
        });
      });

      // Cleanup afterwards
      afterEach(done => {
        server.stop();
        server = null;
        setTimeout(() => done(), 100);
      });

      /* --- Tests --- */

      it(`should work with ${transport}`, done => {
        const payload = { foo: 'bar' };
        server.on('connection', c => {
          c.subscribe('test', data => {
            expect(data).toEqual(payload);
            done();
          });
        });
        server.on('error', e => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', e => {
          throw new Error(e);
        });
        client.write('test', payload);
      });

      it(`should handle foreign characters with ${transport}`, done => {
        const payload = { foo: '한자' };
        server.on('connection', c => {
          c.subscribe('test', data => {
            expect(data).toEqual(payload);
            done();
          });
        });
        server.on('error', e => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', e => {
          throw new Error(e);
        });
        client.write('test', payload);
      });

      it(`should handle large payloads with ${transport}`, done => {
        const largePayload = [];
        while (largePayload.length < 2048) {
          largePayload.push({ foo: 'bar' });
        }

        server.on('connection', c => {
          c.subscribe('test.large', data => {
            expect(data).toEqual(largePayload);
            done();
          });
        });
        server.on('error', e => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', e => {
          throw new Error(e);
        });
        client.write('test.large', largePayload);
      });

      it('should not trigger for unsubscribed channels', done => {
        const payload = { foo: 'bar' };
        server.on('connection', c => {
          c.subscribe('test', () => {
            // Throw on purpose
            expect(false).toBe(true);
            done();
          });

          c.unsubscribe('test');
        });
        server.on('error', e => {
          throw new Error(e);
        });

        const client = connect({ transport: soc });
        client.on('error', e => {
          throw new Error(e);
        });
        setTimeout(() => client.write('test', payload), 100);
        setTimeout(() => done(), 200);
      });
    });
  });
});
