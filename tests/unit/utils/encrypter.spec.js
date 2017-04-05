/**
 * Encrypter
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const expect = require('chai').expect;
const sinon = require('sinon');
const testModule = require('../../../src/utils/encrypter');

/* Tests ---------------------------------------------------------------------*/

describe('Encrypter', () => {

  describe('#encrypt()', () => {

    it('should properly encrypt packet', () => {
      const out = testModule.encrypt([0,1,2,3], 'some_16_char_string');
      expect(out).to.deep.equal([212,1,29,148]);
    });
  });

  describe('#decrypt()', () => {

    it('should properly decrypt packet', () => {
      const out = testModule.decrypt([212,1,29,148], 'some_16_char_string');
      expect(out).to.deep.equal([0,1,2,3]);
    });
  });
});