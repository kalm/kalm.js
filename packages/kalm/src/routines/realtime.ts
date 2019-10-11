/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

export function realtime(): KalmRoutine {
  return function queue(channel: string, params: object, emitter: EventEmitter): Queue {
    let i: number = 0;

    function add(packet: Buffer): void {
      emitter.emit('stats.queueAdd', { frameId: i, packet: 0 });
      emitter.emit('stats.queueRun', { frameId: i, packets: 1 });
      emitter.emit('runQueue', { frameId: i++, channel, packets: [packet] });
      if (i > 255) i = 0;
    }

    function size(): number { return 0; }
    function flush(): void {}

    return { add, size, flush };
  };
}
