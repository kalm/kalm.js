import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from '../../../kalm/src/utils/events.ts';
import webtransport from '../../src/webtransport.ts';

describe.skip('webtransport transport', () => {
  it('basic setup', () => {
    assert.strictEqual(typeof webtransport, 'function');
    const transport = webtransport();
    assert.strictEqual(typeof transport, 'function');
    const socket = transport({}, new EventEmitter());

    assert.strictEqual(typeof socket.bind, 'function');
    assert.strictEqual(typeof socket.connect, 'function');
    assert.strictEqual(typeof socket.disconnect, 'function');
    assert.strictEqual(typeof socket.remote, 'function');
    assert.strictEqual(typeof socket.stop, 'function');
    assert.strictEqual(typeof socket.send, 'function');
  });

  describe('Given an empty handle reference and no configs', () => {
    const transport = webtransport();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return null values', () => {
        assert.deepStrictEqual(socket.remote(), { host: null, port: null });
      });
    });
  });

  describe('Given a handle reference and no configs', () => {
    const transport = webtransport();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return handle\'s values from headers', () => {
        assert.deepStrictEqual(
          socket.remote({
            headers: { 'x-forwarded-for': '127.0.0.1' },
            connection: { remotePort: 3000 },
          }),
          { host: '127.0.0.1', port: 3000 },
        );
      });

      it('should return handle\'s values from connection', () => {
        assert.deepStrictEqual(
          socket.remote({ connection: { remoteAddress: '127.0.0.1', remotePort: 3000 } }),
          { host: '127.0.0.1', port: 3000 },
        );
      });
    });
  });
});
