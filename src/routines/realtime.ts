/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { Queue, Routine } from '../types';

/* Methods -------------------------------------------------------------------*/

function realtime(): Routine {
    return function queue(channel: string, params: object, emitter: EventEmitter): Queue {
        let i: number = 0;

        function add(packet: Promise<number[]>): void {
            emitter.emit('stats.queueAdd', { frameId: i, packet: 0 });
            packet.then(p => {
                emitter.emit('stats.queueRun', { frameId: i, packets: 1 });
                emitter.emit('runQueue', { frameId: i++, channel, packets: [p] });
                if (i > 255) i = 0;
            });
        }

        function size(): number { return 0; }
        function flush(): void {}

        return { add, size, flush };
    };
}

/* Exports -------------------------------------------------------------------*/

export default realtime;
