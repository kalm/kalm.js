/* Methods -------------------------------------------------------------------*/

export function realtime(): KalmRoutine {
  return function queue(params: object, routineEmitter: (frameId: number) => any): Queue {
    let frameId: number = 0;

    function add(): void {
      routineEmitter(frameId);
      if (++frameId > 0xffff) frameId = 0;
    }

    function flush(): void {}

    return { add, flush, size: () => 0 };
  };
}
