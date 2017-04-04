/** Server Test */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');
const testModule = require('../../../src/components/server');

/* Tests ---------------------------------------------------------------------*/

describe.only('Server', () => {

  describe('#init()', () => {
    it('should start listening for traffic', () => {

    });
  });

  describe('#broadcast(channel, payload)', () => {
    const server = testModule({});

    it('should call send on all connections', () => {
      testServer.connections.push(clientFactory.create({ socket: testSocket }));
      testServer.broadcast('test', 'test');
      expect(testServer.connections[0].channels.test.packets).to.include('test');
    });
  });

  describe('#stop(callback)', () => {
    const server = testModule({});

    it('should call the appropriate adapter\'s stop', (done) => {
      const adapterTest = sinon.mock(adapters.resolve(testServer.options.adapter));
      testServer.stop(() => {
        testServer.listener = { 
          close: function(cb) {
            cb(); 
          } 
        };

        testServer.stop(() => {
          expect(testServer.listener).to.be.null;
          sinon.mock.restore();
          done();
        });
      });
    });
  });
});