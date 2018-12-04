/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { Queue, Routine } from '../types';

/* Methods -------------------------------------------------------------------*/

function realtime(): Routine {
    return function queue(channel: string, params: object, emitter: EventEmitter): Queue {
        function add(packet: number[]): void {
            emitter.emit('runQueue', [packet]);
        }

        function size(): number { return 0; }
        function flush(): void {}

        return { add, size, flush };
    };
}

/* Exports -------------------------------------------------------------------*/

export = realtime;
