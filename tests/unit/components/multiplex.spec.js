/** Multiplex test */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const testModule = require('../../../src/components/multiplex');

/* Tests ---------------------------------------------------------------------*/

describe('Multiplex', () => {

  describe('#subscribe()', () => {
    const scope = { channels: {} };
    const multiplex = testModule(scope);

    it('should use/create a channel and add the handler to it', () => {
      const testHandler = function foo() {};
      multiplex.subscribe('test', testHandler);

      expect(scope.channels.test).to.be.instanceof(Object);
      expect(scope.channels.test).to.include(testHandler);
    });
  });

  describe('#unsubscribe()', () => {
    const scope = { channels: {} };
    const multiplex = testModule(scope);

    it('should remove a handler from a channel', () => {
      const testHandler = function foo() {};
      multiplex.subscribe('test', testHandler);
      multiplex.unsubscribe('test', testHandler);

      expect(scope.channels.test).to.be.instanceof(Object);
      expect(scope.channels.test).to.not.include(testHandler);
    });
  });

  describe('#trigger()', () => {

    it('', () => {

    });
  });
})