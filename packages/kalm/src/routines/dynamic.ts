/* Methods -------------------------------------------------------------------*/

export function dynamic({ hz, maxPackets = Infinity }: { hz: number, maxPackets?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }

  return function queue(channel: string, params: object, channelEmitter: NodeJS.EventEmitter, clientEmitter: NodeJS.EventEmitter): Queue {
    let timer: NodeJS.Timer = null;
    const packets: Buffer[] = [];
    let i: number = 0;

    function _step(): void {
      clearTimeout(timer);
      timer = null;
      channelEmitter.emit('runQueue', { frameId: i++, channel, packets });
      if (i > 255) i = 0;
      packets.length = 0;
      clientEmitter.emit(`${channel}.queueRun`, { frameId: i, packets: packets.length });
    }

    function add(packet: Buffer): void {
      if (packets.length >= maxPackets - 1) {
        packets.push(packet);
        _step();
        clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: packets.length });
        return;
      }
      if (timer === null) {
        timer = setTimeout(_step, Math.round(1000 / hz));
      }
      packets.push(packet);
      clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: packets.length });
    }

    function size(): number { return packets.length; }

    return { add, size, flush: _step };
  };
}
