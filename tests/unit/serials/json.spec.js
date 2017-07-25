/** JSON serializer tests */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const testModule = require('../../../src/serials/json');

/* Tests ---------------------------------------------------------------------*/

const tests = {
  strings: ['string', 'with\"\'quotes'],
  numbers: [42, 0, Math.PI],
  booleans: [true, false],
  arrays: [[1,2,3]],
  objects: [{foo: 'bar'}]
};

function wrap(data) {
  return ['test-channel', [data]];
}

describe('JSON Encoder', () => {

  describe('#encode(payload)', () => {

    Object.keys(tests).forEach((test) => {
      it('should encode ' + test, () => { 
        tests[test].forEach((payload) => {
          expect(testModule.encode(wrap(payload))).to.be.instanceof(Array);
        });
      });
    });
  });

  describe('#decode(payload)', () => {

    Object.keys(tests).forEach((test) => {
      it('should decode ' + test, () => { 
        tests[test].forEach((payload) => {
          const buffer = testModule.encode(wrap(payload));
          const result = testModule.decode(buffer);
          expect(result[1][0]).to.deep.equal(payload);
        });
      });
    });
  });
});