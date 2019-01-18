/**
 * Kalm integration test suite
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const Kalm = require('../../packages/kalm/bin/kalm');

/* Suite --------------------------------------------------------------------*/

describe('Integration tests', () => {

	['ipc', 'tcp', 'udp', 'ws'].forEach((transport) => {
		describe('Testing ' + transport + ' transport', () => {
      let server;
      let soc = require(`../../packages/${transport}/bin/${transport}`)();

			/* --- Setup ---*/

			// Create a server before each scenario
			beforeEach(() => {
				server = Kalm.listen({
          transport: soc
				});
				server.on('error', console.error)
			});

			// Cleanup afterwards
			afterEach((done) => {
        server.stop();
        server = null;
				setTimeout(() => done(), 100);
			});

			/* --- Tests --- */

			it('should work with ' + transport, (done) => {
				let payload = {foo:'bar'};
				server.on('connection', (c) => {
					c.subscribe('test', (data) => {
						expect(data).to.eql(payload);
						done();
					});
				});

				let client = Kalm.connect({ transport: soc });
				client.write('test', payload);
			});

			it('should handle large payloads with ' + transport, (done) => {
				let largePayload = [];
				while(largePayload.length < 2048) {
					largePayload.push({foo: 'bar'});
				}

				server.on('connection', (c) => {
					c.subscribe('test.large', (data) => {
						expect(data).to.eql(largePayload);
						done();
					});
				});

				let client = Kalm.connect({ transport: soc });
				client.write('test.large', largePayload);
			});

      it('should not trigger for unsubscribed channels', (done) => {
        let payload = {foo:'bar'};
        server.on('connection', (c) => {
          c.subscribe('test', (data) => {
            expect(false).to.be.true; // Throw on purpose
            done();
          });

          c.unsubscribe('test');
        });

        let client = Kalm.connect({ transport: soc });
        setTimeout(() => client.write('test', payload), 100);
        setTimeout(() => done(), 200);
      });
		});
	});
});