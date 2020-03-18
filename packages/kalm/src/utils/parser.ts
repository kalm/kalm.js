/* Local variables -----------------------------------------------------------*/

const singleIndiceCache = {};
const doubleIndiceCache = {};

/* Methods -------------------------------------------------------------------*/

export function indiceBuffer(num): Buffer {
  if (singleIndiceCache[`${num}`]) return singleIndiceCache[`${num}`];
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(num, 0);
  singleIndiceCache[`${num}`] = buf;
  return buf;
}

export function doubleIndiceBuffer(num): Buffer {
  if (doubleIndiceCache[`${num}`]) return doubleIndiceCache[`${num}`];
  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16BE(num, 0);
  doubleIndiceCache[`${num}`] = buf;
  return buf;
}

function _numericSize(bytes: Buffer, index: number): number {
  return (bytes[index] << 8) | bytes[index + 1];
}

export function serializeLegacy(frameId: number, channel: Channel, packets: Buffer[]): Buffer {
  const serializedPackets = packets.reduce((acc, curr) => {
    acc.push(doubleIndiceBuffer(curr.length));
    acc.push(curr);
    return acc;
  }, []);

  return Buffer.concat([
    indiceBuffer(frameId % 255),
    channel.channelBuffer,
    doubleIndiceBuffer(packets.length),
    ...serializedPackets,
  ]);
}

export function deserializeLegacy(payload: Buffer): RawFrame {
  const channelLength = payload[1];
  let caret = 4 + channelLength;
  const totalPackets = _numericSize(payload, 2 + channelLength);

  function _parseFramePacket(): Buffer[] {
    const packets: Buffer[] = [];
    for (let p = 0; p < totalPackets; p++) {
      if (caret >= payload.length) break;
      const packetLength = _numericSize(payload, caret);
      packets.push(payload.slice(2 + caret, 2 + packetLength + caret));
      caret = 2 + caret + packetLength;
    }
    return packets;
  }

  const result = {
    channel: String.fromCharCode(...payload.slice(2, 2 + channelLength)),
    frameId: payload[0],
    packets: _parseFramePacket(),
    payloadBytes: payload.length,
  };

  return result;
}
