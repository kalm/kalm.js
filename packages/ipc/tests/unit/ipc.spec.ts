import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ipc from '../../src/ipc.ts';
import { EventEmitter } from '../../../kalm/src/utils/events.ts';

describe('IPC transport', () => {
  it('basic setup', () => {
    assert.strictEqual(typeof ipc, 'function');
    const transport = ipc();
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
    const transport = ipc();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return null values', () => {
        assert.deepStrictEqual(socket.remote(), { host: null, port: null });
      });
    });
  });

  describe('Given a handle reference and no configs', () => {
    const transport = ipc();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return handle\'s values', () => {
        assert.deepStrictEqual(
          socket.remote({ _server: { _pipeName: '/foo' }, _handle: { fd: 12345 } }),
          { host: '/foo', port: 12345 },
        );
      });
    });
  });
});
