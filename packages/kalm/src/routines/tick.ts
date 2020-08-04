/* Methods -------------------------------------------------------------------*/

export function tick({ hz, seed = 0 }: { hz: number, seed?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }

  let frameId: number = seed || 0;

  return function queue(params: object, routineEmitter: NodeJS.EventEmitter): Queue {
    let timer: NodeJS.Timer = null;

    function _step(): void {
      frameId++;
      routineEmitter.emit('runQueue', { frameId });
    }

    function add(): void {
      if (timer === null) timer = setInterval(_step, 1000 / hz);
    }

    return { add, flush: _step, emitter: routineEmitter };
  };
}
