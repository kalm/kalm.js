import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from '../../../kalm/src/utils/events.ts';
import udp from '../../src/udp.ts';

describe('UDP transport', () => {
  it('basic setup', () => {
    assert.strictEqual(typeof udp, 'function');
    const transport = udp();
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
    const transport = udp();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return null values', () => {
        assert.deepStrictEqual(socket.remote(), { host: null, port: null });
      });
    });
  });

  describe('Given a handle reference and no configs', () => {
    const transport = udp();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return handle\'s values', () => {
        assert.deepStrictEqual(
          socket.remote({ host: '127.0.0.1', port: 3000 }),
          { host: '127.0.0.1', port: 3000 },
        );
      });
    });
  });
});
