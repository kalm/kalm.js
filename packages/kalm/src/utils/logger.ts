/* Local variables ------------------------------------------------------------*/

declare const window: any;

let enabled: boolean = null;
const prefix = `KALM${typeof process === 'object' && ` (pid:${process.pid})`}`;

/* Methods -------------------------------------------------------------------*/

export function log(msg: string): void {
  if (enabled === null) {
    enabled = (
      (typeof process === 'object' && process.env.NODE_DEBUG)
        || (typeof window === 'object' && window.DEBUG)
        || ''
    ).indexOf('kalm') > -1;
  }
  if (enabled === true) console.log(`${prefix}: ${msg}`); // eslint-disable-line no-console
}
