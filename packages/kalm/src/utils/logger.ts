/* Local variables ------------------------------------------------------------*/

declare const window: any;

const enabled: boolean = (
  (typeof process === 'object' && process.env.NODE_DEBUG)
    || (typeof window === 'object' && window.DEBUG)
    || ''
).indexOf('kalm') > -1;

/* Methods -------------------------------------------------------------------*/

function log(msg: string): void {
  if (enabled) console.log(msg); // eslint-disable-line no-console
}

/* Exports --------------------------------------------------------------------*/

export default { log };
