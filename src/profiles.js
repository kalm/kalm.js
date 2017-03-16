/**
 * class @profiles
 */

'use strict';

/* Methods -------------------------------------------------------------------*/

const dynamic = {
	tick: 16,
	maxBytes: 1400
};

const heartbeat = {
	tick: 16,
	maxBytes: null
};

const threshold = {
	tick: null,
	maxBytes: 1400
};

const manual = {
	tick: null, 
	maxBytes: null 
};


/* Exports -------------------------------------------------------------------*/

module.exports = { dynamic, heartbeat, threshold, manual };