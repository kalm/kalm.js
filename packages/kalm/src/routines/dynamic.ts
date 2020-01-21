/* Methods -------------------------------------------------------------------*/

export function dynamic({ hz, maxBytes }: KalmRoutineParams): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }
  if (maxBytes === undefined || maxBytes === null || maxBytes <= 0) maxBytes = Infinity;
  if (Number.isNaN(maxBytes)) {
    throw new Error(`Unable to set maxBytes value of ${maxBytes}. Must be a Number`);
  }

  return function queue(channel: string, params: object, channelEmitter: EventEmitter, clientEmitter: EventEmitter): Queue {
    let timer: NodeJS.Timer = null;
    const packets: Buffer[] = [];
    let i: number = 0;
    let totalBytes: number = 0;

    function _step(): void {
      clearTimeout(timer);
      timer = null;
      channelEmitter.emit('runQueue', { frameId: i++, channel, packets });
      if (i > 255) i = 0;
      packets.length = 0;
      totalBytes = 0;
      clientEmitter.emit(`${channel}.queueRun`, { frameId: i, packets: packets.length });
    }

    function add(packet: Buffer): void {
      if (totalBytes + packet.length > maxBytes) _step();

      totalBytes += packet.length;
      clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: packets.length });
      if (timer === null) {
        timer = setTimeout(_step, Math.round(1000 / hz));
      }
      packets.push(packet);
    }

    function size(): number { return packets.length; }

    return { add, size, flush: _step };
  };
}
