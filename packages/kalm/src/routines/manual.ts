export function manual(): { flush: () => void, queue: KalmRoutine } {
  let emitter = null;
  let frameId = 0;
  let numPackets = 0;

  function flush() {
    if (emitter) {
      emitter(frameId);
      numPackets = 0;
      if (++frameId > 0xffffffff) frameId = 0;
    }
  }

  function queue(params: object, routineEmitter: (frameId: number) => any): Queue {
    emitter = routineEmitter;

    function add(): void {
      numPackets++;
    }

    return { add, flush, size: () => numPackets };
  };

  return {
    flush,
    queue,
  };
}
