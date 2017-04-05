/** Server Test */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');
const testModule = require('../../../src/components/server');

const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');
const clientFactory = require('../../../src/clientFactory');

/* Tests ---------------------------------------------------------------------*/

describe('Server', () => {

  function testObject(props, modules) {
    modules = modules || {};
    const server = Object.assign({ connections: [] }, EventEmitter.prototype, props);
    return Object.assign(server, testModule(server, crypto, clientFactory));
  }

  function transportMock() {
    return sinon.mock({
      createSocket: function() {}, 
      attachSocket: function() {},
      send: function() {},
      disconnect: function() {},
      listen: function() {},
      stop: function() {}
    });
  }

  describe('#init()', () => {
    it('should start listening for traffic', (done) => {
      const tMock = transportMock();
      const testSocket = Promise.resolve('test');
      tMock.expects('listen')
        .once()
        .returns(testSocket);

      const server = testObject({
        transport: tMock.object
      });

      server.init();
      setTimeout(() => {
        tMock.verify();
        expect(server.listener).to.equal('test');
        done();
      }, 1);
    });
  });

  describe('#broadcast(channel, payload)', () => {

    it('should call send on all connections', () => {
      const server = testObject({});
      const mockClient = sinon.mock({
        write: function() {}
      });
      mockClient.expects('write')
        .once()
        .withArgs('test', 'test');
      server.connections.push(mockClient.object);
      server.broadcast('test', 'test');
      mockClient.verify();
    });
  });

  describe('#stop(callback)', () => {

    it('should call the appropriate adapter\'s stop', (done) => {
      const tMock = transportMock();
      const cb = function() {};
      const server = testObject({
        transport: tMock.object,
        listener: 'test'
      });
      server.stop(cb);

      tMock.expects('stop')
        .once()
        .withArgs(server, cb);

      setTimeout(() => {
        tMock.verify();
        expect(server.listener).to.be.null;
        done();
      },1);
    });
  });
});