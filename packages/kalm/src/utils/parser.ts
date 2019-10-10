/* Methods -------------------------------------------------------------------*/

function _uint16Size(value: number): number[] {
  return [value >>> 8, value & 0xff];
}

function _numericSize(bytes: Buffer, index: number): number {
  return (bytes[index] << 8) | bytes[index + 1];
}

function serialize(frameId: number, channel: string, packets: Buffer[]): number[] {
  const channelLen: number = channel.length;
  const result: number[] = [frameId % 255, channelLen];

  for (let letter = 0; letter < channelLen; letter++) {
    result.push(channel.charCodeAt(letter));
  }

  result.push(..._uint16Size(packets.length));

  packets.forEach((packet: Buffer) => {
    if (!(packet instanceof Buffer)) throw new Error(`Cannot send packet ${packet}. Must be of type Buffer`);
    result.push(..._uint16Size(packet.length));
    result.push(...packet);
  });

  return result;
}

function deserialize(payload: Buffer): RawFrame {
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

/* Exports -------------------------------------------------------------------*/

export default { serialize, deserialize };
