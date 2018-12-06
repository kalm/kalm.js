/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { Queue, Routine } from '../types';

/* Methods -------------------------------------------------------------------*/

function dynamic(hz: number): Routine {
    if (hz <= 0 || hz > 1000) {
        throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
    }

    return function queue(channel: string, params: object, emitter: EventEmitter): Queue {
        let timer: NodeJS.Timer = null;
        const packets: number[][] = [];
        let i: number = 0;

        function add(packet: number[]): void {
            if (timer === null) {
                timer = setTimeout(_step, Math.round(1000 / hz));
            }
            packets.push(packet);
        }

        function _step(): void {
            clearTimeout(timer);
            timer = null;
            emitter.emit('runQueue', { frameId: i++, channel, packets });
            if (i > 255) i = 0;
            packets.length = 0;
        }

        function size(): number { return packets.length; }

        return { add, size, flush: _step };
    };
}

/* Exports -------------------------------------------------------------------*/

export default dynamic;
