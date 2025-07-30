import * as ipc from '../../src/ipc';
import { EventEmitter } from '../../../kalm/src/utils/events';

describe('IPC transport', () => {
  it('basic setup', () => {
    expect(typeof ipc.default).toBe('function');
    const transport = ipc.default();
    expect(typeof transport).toBe('function');
    const socket = transport({}, new EventEmitter());

    expect(socket).toHaveProperty('bind', expect.any(Function));
    expect(socket).toHaveProperty('connect', expect.any(Function));
    expect(socket).toHaveProperty('disconnect', expect.any(Function));
    expect(socket).toHaveProperty('remote', expect.any(Function));
    expect(socket).toHaveProperty('stop', expect.any(Function));
    expect(socket).toHaveProperty('send', expect.any(Function));
  });

  describe('Given an empty handle reference and no configs', () => {
    const transport = ipc.default();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return null values', () => {
        expect(socket.remote).toEqual({ host: null, port: null });
      });
    });
  });

  describe('Given a handle reference and no configs', () => {
    const transport = ipc.default();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return handle\'s values', () => {
        expect(socket.remote({ _server: { _pipeName: '/foo' }, _handle: { fd: 12345 } })).toEqual({ host: '/foo', port: 12345 });
      });
    });
  });
});
