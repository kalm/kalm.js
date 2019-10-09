/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

function tick(hz: number, seed: number = Date.now()): KalmRoutine {
    if (hz <= 0 || hz > 1000) {
        throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
    }
    let i: number = 0;

    function _delta(): number {
        const now: number = Date.now() - seed;
        i = (now / (1000 / hz)) % 255;
        return Math.round(now % (1000 / hz));
    }

    return function queue(channel: string, params: object, emitter: EventEmitter): Queue {
        let timer: NodeJS.Timer = null;
        const packets: Buffer[] = [];

        function add(packet: Buffer): void {
            emitter.emit('stats.queueAdd', { frameId: i, packet: packets.length });
            if (timer === null) {
                timer = setTimeout(_step, _delta());
            }
            packets.push(packet);
        }

        function _step(): void {
            emitter.emit('stats.queueRun', { frameId: i, packets: packets.length });
            clearTimeout(timer);
            timer = null;
            emitter.emit('runQueue', { frameId: i, channel, packets });
            packets.length = 0;
        }

        function size(): number { return packets.length; }

        return { add, size, flush: _step };
    };
}

/* Exports -------------------------------------------------------------------*/

export default tick;
