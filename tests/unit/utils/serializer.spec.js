/** Serializer tests */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');
const testModule = require('../../../src/utils/serializer');

/* Tests ---------------------------------------------------------------------*/

describe('Serializer', () => {

  describe('#serialize()', () => {

    it('should properly seralize packets - one channel', () => {
      const out = testModule.serialize(0, 'test', [[0,1,2,3]]);
      expect(Array.prototype.slice.apply(out)).to.deep.equal([0, 4, 116, 101, 115, 116, 0, 1, 0, 4, 0, 1, 2, 3])
    });
  });

  describe('#deserialize()', () => {

    it('should properly deseralize packets - one frame', () => {
      const out = testModule.deserialize([0, 4, 116, 101, 115, 116, 0, 1, 0, 4, 0, 1, 2, 3]);
      expect(out).to.deep.equal([{
        frame: 0,
        channel: 'test',
        payloadBytes: 14,
        packets: [[0,1,2,3]]
      }]);
    });

    it('should properly deseralize packets - multi frames', () => {
      const out = testModule.deserialize([0, 4, 116, 101, 115, 116, 0, 1, 0, 4, 0, 1, 2, 3, 1, 4, 115, 100, 114, 115, 0, 1, 0, 4, 1, 2, 3, 4]);
      expect(out).to.deep.equal([{
        frame: 0,
        channel: 'test',
        payloadBytes: 28,
        packets: [[0,1,2,3]]
      },
      {
        frame: 1,
        channel: 'sdrs',
        payloadBytes: 28,
        packets: [[1,2,3,4]]
      }]);
    });
  });
});