/** Client test */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');

const testModule = require('../../../src/components/client');
const EventEmitter = require('events').EventEmitter;
const queueList = require('../../../src/components/queueList');
const multiplex = require('../../../src/components/multiplex');
const serializer = require('../../../src/utils/serializer');
const sessions = require('../../../src/utils/sessions');
const encrypter = require('../../../src/utils/encrypter');

/* Tests ---------------------------------------------------------------------*/

describe('Client', () => {

  function testObject(props, modules) {
    modules = modules || {};
    const client = Object.assign({ backlog: [], socketTimeout: 300000, connected: 1}, EventEmitter.prototype, props);
    return Object.assign(client, testModule(client, modules.queueList, modules.multiplex, modules.serializer, modules.sessions, modules.encrypter));
  }

  function transportMock() {
    return sinon.mock({
      createSocket: function() {}, 
      attachSocket: function() {},
      send: function() {},
      disconnect: function() {}
    });
  }

  describe('#init()', () => {

    it('should attempt to connect if no sockets are given', () => {
      const tMock = transportMock();
      const testSocket = {};
      tMock.expects('createSocket')
        .once()
        .returns(testSocket);
      tMock.expects('attachSocket')
        .once()
        .withArgs(testSocket);

      const client = testObject({
        transport: tMock.object
      });

      client.init();
      tMock.verify();
    });

    it('should NOT attempt to connect if a socket is given', () => {
      const tMock = transportMock();
      const sessionMock = sinon.mock(sessions);
      const testSocket = {};
      tMock.expects('createSocket')
        .never();
      tMock.expects('attachSocket')
        .once()
        .withArgs(testSocket);
      sessionMock.expects('resolve')
        .once()
        .withArgs('123');

      const client = testObject({
        id: '123',
        socket: testSocket,
        transport: tMock.object
      }, {
        sessions: sessionMock.object
      });

      client.init();
      tMock.verify();
      sessionMock.verify();
    });
  });

  describe('#write()', () => {
    
    it('should push the encoded payload to the proper queue', () => {
      const testPayloads = [
        {foo: 'bar'}
      ];
      const addSpy = sinon.spy();
      const queueListMock = sinon.mock(queueList());
      const client = testObject({}, { queueList: queueListMock.object });

      queueListMock.expects('queue')
        .withArgs('test-channel')
        .once()
        .returns({ add: addSpy });

      testPayloads.forEach((payload) => {
        client.write('test-channel', payload);
      });

      queueListMock.verify();
      expect(addSpy.calledOnce).to.be.true;
    });
  });

  describe('#destroy()', () => {

    it('should call the appropriate adapter\'s disconnect', (done) => {
      const tMock = transportMock();
      const queueListMock = sinon.mock(queueList());
      const client = testObject({ 
        socket: 'not null', 
        connected: 2,
        transport: tMock.object
      }, { queueList: queueListMock.object });

      queueListMock.expects('flush')
        .once();
      tMock.expects('disconnect')
        .once()
        .withArgs(client)
      client.destroy();

      // Artificial Delay
      setTimeout(() => {
        tMock.verify();
        queueListMock.verify();
        done();
      });
    });
  });
});