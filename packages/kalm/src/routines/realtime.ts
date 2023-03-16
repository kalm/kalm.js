export function realtime(): KalmRoutine {
  return function queue(params: { deferred: boolean }, routineEmitter: (frameId: number) => any): Queue {
    let frameId = 0;

    function add(): void {
      if (params.deferred == true) {
        setTimeout(_step, 0);
      }
      else {
        _step();
      }
    }

    function _step() {
      routineEmitter(frameId);
      if (++frameId > 0xffff) frameId = 0;
    }

    function flush(): void {}

    return { add, flush, size: () => 0 };
  };
}
