/* Local variables ------------------------------------------------------------*/

declare const window: any;

const enabled: boolean = (
  (typeof process === 'object' && process.env.NODE_DEBUG)
    || (typeof window === 'object' && window.DEBUG)
    || ''
).indexOf('kalm') > -1;

const prefix = `KALM ${typeof process === 'object' && process.pid}`;

/* Methods -------------------------------------------------------------------*/

export function log(msg: string): void {
  if (enabled) console.log(`${prefix}: ${msg}`); // eslint-disable-line no-console
}
