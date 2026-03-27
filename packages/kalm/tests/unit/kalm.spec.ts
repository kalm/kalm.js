import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { listen, connect } from '../../src/kalm.ts';

const bindSpy = mock.fn();
const connectSpy = mock.fn();
const mockTransport = () => () => ({ bind: bindSpy, connect: connectSpy });

describe('Kalm constructors', () => {
  describe('#listen', () => {
    let server;

    it('should throw an error if no transports are provided', () => {
      assert.throws(listen);
    });

    it('listen should bind to a transport if one is provided', () => {
      server = listen({ transport: mockTransport() });
      assert.ok(bindSpy.mock.calls.length > 0);
    });

    it('should return an object with all the required fields', () => {
      assert.ok('label' in server);
    });
  });

  describe('#connect', () => {
    let client;

    it('should throw an error if no transports are provided', () => {
      assert.throws(connect);
    });

    it('listen should connect via a transport if one is provided', () => {
      client = connect({ transport: mockTransport() });
      assert.ok(connectSpy.mock.calls.length > 0);
    });

    it('should return an object with all the required fields', () => {
      assert.ok('label' in client);
    });
  });
});
