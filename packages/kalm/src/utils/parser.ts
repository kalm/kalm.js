/* Methods -------------------------------------------------------------------*/

export function doubleIndiceBuffer(num) {
  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16BE(num, 0);
  return buf;
}

export function indiceBuffer(num) {
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(num, 0);
  return buf;
}

function _numericSize(bytes: Buffer, index: number): number {
  return (bytes[index] << 8) | bytes[index + 1];
}

export function serializeLegacy(frameId: number, channel: Channel, packets: Buffer[]): Buffer {
  return Buffer.concat([
    indiceBuffer(frameId % 255),
    channel.channelBuffer,
    doubleIndiceBuffer(packets.length),
    ...packets.map((packet: Buffer) => {
      if (!(packet instanceof Buffer)) throw new Error(`Cannot send packet ${packet}. Must be of type Buffer`);
      return Buffer.concat([doubleIndiceBuffer(packet.length), packet]);
    }),
  ]);
}

export function deserializeLegacy(payload: Buffer): RawFrame {
  const channelLength = payload[1];
  let caret = 4 + channelLength;
  const totalPackets = _numericSize(payload, 2 + channelLength);

  function _parseFramePacket(): Buffer[] {
    const packets: Buffer[] = [];
    for (let p = 0; p < totalPackets; p++) {
      if (caret >= payload.length) continue;
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
