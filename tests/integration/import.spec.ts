import { connect, routines } from '../../packages/kalm/dist/kalm';
import ipc from '../../packages/ipc/dist/ipc';

describe('Testing module loading patterns', () => {
  it('Should support import syntax', () => {
    expect(typeof connect).toBe('function');
    expect(routines).toHaveProperty('realtime');
    expect(typeof ipc).toBe('function');
  });

  it('Should support require syntax for kalm core', () => {
    expect(typeof require('../../packages/kalm/dist/kalm').connect).toBe('function');
  });

  it('Should support require syntax for kalm routines', () => {
    expect(require('../../packages/kalm/dist/kalm').routines).toHaveProperty('realtime');
  });

  it('Should support require syntax for kalm transports', () => {
    expect(typeof require('../../packages/ipc/dist/ipc')).toBe('function');
  });
});
