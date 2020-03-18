/* Methods -------------------------------------------------------------------*/

export function dynamic({
  hz,
  maxPackets = Infinity,
  maxBytes = 60000,
}: { hz: number, maxPackets?: number, maxBytes?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }

  return function queue(channel: string, params: object, channelEmitter: NodeJS.EventEmitter, clientEmitter: NodeJS.EventEmitter): Queue {
    let timer: NodeJS.Timer = null;
    const packets: Buffer[] = [];
    let totalBytes = 0;
    let i: number = 0;

    function _step(): void {
      clearTimeout(timer);
      timer = null;
      channelEmitter.emit('runQueue', { frameId: i++, channel, packets });
      if (i > 255) i = 0;
      packets.length = 0;
      totalBytes = 0;
      clientEmitter.emit(`${channel}.queueRun`, { frameId: i, packets: packets.length });
    }

    function _add(packet: Buffer) {
      packets.push(packet);
      totalBytes += packet.length;
      clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: packets.length });
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

      if (packets.length >= maxPackets - 1) {
        _add(packet);
        _step();
        return;
      }

      if (timer === null) {
        timer = setTimeout(_step, Math.round(1000 / hz));
      }

      _add(packet);
    }

    function size(): number { return packets.length; }

    return { add, size, flush: _step };
  };
}
