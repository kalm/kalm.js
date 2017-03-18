/** @module profiles */

'use strict';

/* Local variables -----------------------------------------------------------*/

const dynamic = Object.freeze({ tick: 16, maxBytes: 1400 });
const heartbeat = Object.freeze({ tick: 16, maxBytes: null });
const threshold = Object.freeze({ tick: null, maxBytes: 1400 });
const manual = Object.freeze({ tick: null,  maxBytes: null });

/* Exports -------------------------------------------------------------------*/

module.exports = { dynamic, heartbeat, threshold, manual };