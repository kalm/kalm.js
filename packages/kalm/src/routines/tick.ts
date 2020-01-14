/* Methods -------------------------------------------------------------------*/

export function tick({ hz, seed = Date.now() }: { hz: number, seed?: number }): KalmRoutine {
  if (hz <= 0 || hz > 1000) {
    throw new Error(`Unable to set Hertz value of ${hz}. Must be between 0.1e13 and 1000`);
  }

  let i: number = 0;

  function _delta(): number {
    const now: number = Date.now() - seed;
    i = (now / (1000 / hz)) % 255;
    return Math.round(now % (1000 / hz));
  }

  return function queue(channel: string, params: object, channelEmitter: NodeJS.EventEmitter, clientEmitter: NodeJS.EventEmitter): Queue {
    let timer: NodeJS.Timer = null;
    const packets: Buffer[] = [];

    function _step(): void {
      clientEmitter.emit(`${channel}.queueRun`, { frameId: i, packets: packets.length });
      clearTimeout(timer);
      timer = null;
      channelEmitter.emit('runQueue', { frameId: i, channel, packets });
      packets.length = 0;
    }

    function add(packet: Buffer): void {
      clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: packets.length });
      if (timer === null) {
        timer = setTimeout(_step, _delta());
      }
      packets.push(packet);
    }

    function size(): number { return packets.length; }

    return { add, size, flush: _step };
  };
}
