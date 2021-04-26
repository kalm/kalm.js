import { connect, routines } from '../../packages/kalm/bin/kalm';
import ipc from '../../packages/ipc/bin/ipc';

describe('Testing module loading patterns', () => {
  it('Should support import syntax', () => {
    expect(typeof connect).toBe('function');
    expect(routines).toHaveProperty('realtime');
    expect(typeof ipc).toBe('function');
  });

  it('Should support require syntax', () => {
    expect(typeof require('../../packages/kalm/bin/kalm').connect).toBe('function');
    expect(require('../../packages/kalm/bin/kalm').routines).toHaveProperty('realtime');
    expect(typeof require('../../packages/ipc/bin/ipc')).toBe('function');
  });
});
