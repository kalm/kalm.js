/**
 * Kalm.profiles
 * Predicates for executing message queues.
 * 'tick' represents the maximum allowed wait time (ms) after an item is added before processing the queue.
 * 'maxBytes' is the maximum bytes that can be contained in a queue. Queues that are about to exceed that value
 * as the result of pushing a new message to it will be processed before-hand. This value includes Kalm frame overhead.
 * 
 * @memberof Kalm
 * @name profiles
 * @example ['dynamic', 'heartbeat', 'threshold', 'realtime', 'manual', { tick: number|null, maxBytes: number|null }]
 */

'use strict';

/* Local variables -----------------------------------------------------------*/

const dynamic = Object.freeze({ tick: 5, maxBytes: 1400 });
const heartbeat = Object.freeze({ tick: 5, maxBytes: null });
const threshold = Object.freeze({ tick: null, maxBytes: 1400 });
const realtime = Object.freeze({ tick: -1, maxBytes: null });
const manual = Object.freeze({ tick: null,  maxBytes: null });

/* Exports -------------------------------------------------------------------*/

module.exports = { dynamic, heartbeat, threshold, realtime, manual };