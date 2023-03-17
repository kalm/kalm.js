export function tick({ hz, seed = 0 }: { hz: number, seed?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }

  return function queue(params: object, routineEmitter: (frameId: number) => any): Queue {
    const adjustedTime = seed ? Date.now() - seed : 0;
    let frameId = Math.floor(adjustedTime / (1000 / hz)) % 0xffffffff;

    let timer: ReturnType<typeof setTimeout> = setTimeout(_init, adjustedTime % Math.round(1000 / hz));
    let numPackets = 0;

    function _step(): void {
      routineEmitter(frameId);
      numPackets = 0;
      if (++frameId > 0xffffffff) frameId = 0;
    }

    function _init(): void {
      clearTimeout(timer);
      timer = setInterval(_step, Math.round(1000 / hz));
      _step();
    }

    function add(): void {
      numPackets++;
    }

    return { add, flush: _step, size: () => numPackets };
  };
}
