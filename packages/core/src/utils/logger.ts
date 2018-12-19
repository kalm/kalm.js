/* Local variables ------------------------------------------------------------*/

const enabled: boolean = (
    (typeof process === 'object' && process.env.NODE_DEBUG && process.env.NODE_DEBUG.indexOf('kalm') > -1) ||
    (typeof window === 'object' && window['BROWSER_DEBUG'] && window['BROWSER_DEBUG'].indexOf('kalm') > -1)
);

/* Methods -------------------------------------------------------------------*/

function log(msg: string): void {
    if (enabled) console.error(msg);
}

/* Exports --------------------------------------------------------------------*/

export default { log, enabled };
