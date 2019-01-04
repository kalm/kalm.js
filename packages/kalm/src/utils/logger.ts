/* Local variables ------------------------------------------------------------*/

const enabled: boolean = (
    (typeof process === 'object' && (process.env.NODE_DEBUG || '').indexOf('kalm') > -1) ||
    (typeof window === 'object' && (window['DEBUG'] || '').indexOf('kalm') > -1)
);

/* Methods -------------------------------------------------------------------*/

function log(msg: string): void {
    if (enabled) console.log(msg);
}

/* Exports --------------------------------------------------------------------*/

export default { log };
