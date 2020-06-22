/* Methods -------------------------------------------------------------------*/

export function realtime(): KalmRoutine {
  return function queue(params: object, routineEmitter: NodeJS.EventEmitter): Queue {
    let frameId: number = 0;

    function add(): void {
      routineEmitter.emit('runQueue', { frameId });
      if (++frameId > 0xffff) frameId = 0;
    }

    function flush(): void {}

    return { add, flush, emitter: routineEmitter };
  };
}
