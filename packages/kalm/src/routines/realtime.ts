/* Methods -------------------------------------------------------------------*/

export function realtime(): KalmRoutine {
  return function queue(channel: string, params: object, channelEmitter: NodeJS.EventEmitter, clientEmitter: NodeJS.EventEmitter): Queue {
    let i: number = 0;

    function add(packet: Buffer): void {
      channelEmitter.emit('runQueue', { frameId: i++, channel, packets: [packet] });
      if (i > 255) i = 0;
      clientEmitter.emit(`${channel}.queueAdd`, { frameId: i, packet: 0 });
      clientEmitter.emit(`${channel}.queueRun`, { frameId: i, packets: 1 });
    }

    function size(): number { return 0; }
    function flush(): void {}

    return { add, size, flush };
  };
}
