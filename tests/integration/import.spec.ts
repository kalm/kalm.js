import { connect, routines } from '../../packages/kalm/bin/kalm';
import ipc from '../../packages/ipc/bin/ipc';

describe('Testing module loading patterns', () => {
  it('Should support import syntax', () => {
    expect(typeof connect).toBe('function');
    expect(routines).toHaveProperty('realtime');
    expect(typeof ipc).toBe('function');
  });

  it('Should support require syntax for kalm core', () => {
    expect(typeof require('../../packages/kalm/bin/kalm').connect).toBe('function');
  });

  it('Should support require syntax for kalm routines', () => {
    expect(require('../../packages/kalm/bin/kalm').routines).toHaveProperty('realtime');
  });

  it('Should support require syntax for kalm transports', () => {
    expect(typeof require('../../packages/ipc/bin/ipc')).toBe('function');
  });
});
