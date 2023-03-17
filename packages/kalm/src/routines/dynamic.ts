export function dynamic({
  maxInterval,
  maxPackets = Infinity,
  maxBytes = Infinity,
}: { maxInterval: number, maxPackets?: number, maxBytes?: number }): KalmRoutine {
  if (maxInterval < 1) {
    throw new Error(`Unable to set millisecond value of ${maxInterval}. Must be above or equal to 1`);
  }

  return function queue(params: any, routineEmitter: (frameId: number) => any): Queue {
    let timer: ReturnType<typeof setTimeout> = null;
    let numPackets = 0;
    let totalBytes = 0;
    let frameId = 0;

    function _step(): void {
      clearTimeout(timer);
      timer = null;
      routineEmitter(frameId);
      if (++frameId > 0xffffffff) frameId = 0;
      numPackets = 0;
      totalBytes = 0;
    }

    function _add(packet: Buffer) {
      if (maxBytes !== Infinity) {
        if (Buffer.isBuffer(packet) || typeof packet === 'string') totalBytes += packet.length;
        else totalBytes += JSON.stringify(packet).length;
      }
      numPackets++;
    }

    function add(packet: Buffer) {
      if (packet.length > maxBytes) {
        throw new Error(`Cannot send packet of size ${packet.length} while maximum bytes per frame is ${maxBytes}`);
      }

      if (packet.length + totalBytes >= maxBytes) {
        _step();
        _add(packet);
        return;
      }

      if (numPackets >= maxPackets - 1) {
        _add(packet);
        _step();
        return;
      }

      if (timer === null) {
        timer = setTimeout(_step, maxInterval);
      }

      _add(packet);
    }

    return { add, flush: _step, size: () => numPackets };
  };
}
