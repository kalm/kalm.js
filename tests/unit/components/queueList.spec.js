/**
 * QueueList
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');
const testModule = require('../../../src/components/queueList');

/* Tests ---------------------------------------------------------------------*/

describe('QueueList', () => {

  describe('#queue()', () => {
  	const scope = { queues: {}, profile: { tick: 10 } };
    const queueManager = testModule(scope);

    it('should create/resolve the queue for name', () => {
      queueManager.queue('test');
      expect(scope.queues.test).to.exist;
    });
  });

  describe('#flush()', () => {
  	const scope = { queues: {}, profile: { tick: 10 } };
    const queueManager = testModule(scope);
    const wrapSpy = sinon.spy();
    const wrapSpy2 = sinon.spy();

    it('should trigger the wrapping of all queues', () => {
      queueManager.queue('test', wrapSpy).add('test');
      queueManager.queue('test2', wrapSpy2);
      queueManager.flush();
      expect(wrapSpy.calledOnce).to.be.true;
      expect(wrapSpy2.calledOnce).to.be.false;
    });
  });
});