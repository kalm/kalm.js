/**
 * Queue
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const testModule = require('../../../src/components/queue');

/* Tests ---------------------------------------------------------------------*/

describe('Queue', () => {

  describe('#add()', () => {

    it('should trigger when adding beyond maxBytes', (done) => {
      const queue = testModule({
        packets: [],
        bytes: 0,
        frame: 0,
        timer: null,
        name: 'abc'
      },
      { tick: null, maxBytes: 3 },
      (scope, packets) => {
        expect(packets.length).to.equal(1);
        done();
      });

      queue.add([1,2]);
    });

    it('should trigger after adding on tick', (done) => {
      const queue = testModule({
        packets: [],
        bytes: 0,
        frame: 0,
        timer: null,
        name: 'abc'
      },
      { tick: 16, maxBytes: null },
      (scope, packets) => {
        expect(packets.length).to.equal(3);
        done();
      });

      queue.add([1,2,3,4,5,6,7,8,9,10]);
      queue.add([1,2,3,4,5,6,7,8,9,10]);
      queue.add([1,2,3,4,5,6,7,8,9,10]);
    });
  });

  describe('#bytes()', () => {
  	it('should estimate the correct ammount of bytes in buffer', () => {
      const queue = testModule({
        packets: [],
        bytes: 0,
        frame: 0,
        timer: null,
        name: 'abc'
      },
      { tick: null, maxBytes: null });

      queue.add([1,2,3,4,5,6,7,8,9,10]);
      queue.add([1,2,3,4,5,6,7,8,9,10]);
      queue.add([1,2,3,4,5,6,7,8,9,10]);
      expect(queue.bytes()).to.equal(43);
    });
  });
});