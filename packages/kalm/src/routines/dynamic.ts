export function dynamic({
  hz,
  maxPackets = Infinity,
  maxBytes = Infinity,
}: { hz: number, maxPackets?: number, maxBytes?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
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
      if (++frameId > 0xffff) frameId = 0;
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
        timer = setTimeout(_step, Math.round(1000 / hz));
      }

      _add(packet);
    }

    return { add, flush: _step, size: () => numPackets };
  };
}
