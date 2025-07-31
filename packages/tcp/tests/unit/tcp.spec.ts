import { EventEmitter } from '../../../kalm/src/utils/events';
import * as tcp from '../../src/tcp';

describe('TCP transport', () => {
  it('basic setup', () => {
    expect(typeof tcp.default).toBe('function');
    const transport = tcp.default();
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
    const transport = tcp.default();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return null values', () => {
        expect(socket.remote()).toEqual({ host: null, port: null });
      });
    });
  });

  describe('Given a handle reference and no configs', () => {
    const transport = tcp.default();
    const socket = transport({}, new EventEmitter());

    describe('when fetching remote', () => {
      it('should return handle\'s values', () => {
        expect(socket.remote({ remoteAddress: '127.0.0.1', remotePort: 3000 })).toEqual({ host: '127.0.0.1', port: 3000 });
      });
    });
  });
});
