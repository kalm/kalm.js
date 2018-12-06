/* Requires ------------------------------------------------------------------*/

import { ByteList, RawFrame } from '../types';

/* Methods -------------------------------------------------------------------*/

function serialize(frameId: number, channel: string, packets: ByteList[]): number[] {
  const channelLen: number = channel.length;
  const result: number[] = [frameId % 255, channelLen];

  for (let letter = 0; letter < channelLen; letter++) {
    result.push(channel.charCodeAt(letter));
  }

  result.push.apply(result, _uint16Size(packets.length));

  packets.forEach(packet => {
    if (packet['splice'] === undefined && !(packet instanceof Buffer)) {
      throw new Error(`
        Cannot send unexpected type ${packet.constructor['name']} \`${JSON.stringify(packet)}\`.
        Verify Serializer output or send data of type Buffer or UInt8Array
      `);
    }
    result.push.apply(result, _uint16Size(packet.length));
    result.push.apply(result, packet);
  });

  return result;
}

function deserialize(payload: ByteList): RawFrame[] {
  const frames: RawFrame[] = [];
  const payloadBytes: number = payload.length;
  let caret: number = 0;

  while (caret < payloadBytes) {
    caret = _parseFrame(frames, payload, caret);
  }

  return frames;
}

function _uint16Size(value: number): ByteList {
  return [value >>> 8, value & 0xff];
}

function _numericSize(bytes: ByteList, index: number): number {
  return (bytes[index] << 8) | bytes[index + 1];
}

function _parseFrame(frames: RawFrame[], payload: ByteList, startIndex: number): number {
  const channelLength = payload[1 + startIndex];
  let caret = 4 + startIndex + channelLength;
  const totalPackets = _numericSize(payload, 2 + startIndex + channelLength);
  const result = {
    channel: _parseFrameChannel(),
    frameId: payload[startIndex],
    packets: _parseFramePacket(),
    payloadBytes: payload.length,
  };

  function _parseFrameChannel(): string {
    const letters = payload.slice(2 + startIndex, 2 + startIndex + channelLength);
    return String.fromCharCode.apply(null, letters);
  }

  function _parseFramePacket(): ByteList[] {
    const packets: ByteList[] = [];
    for (let p = 0; p < totalPackets; p++) {
      const packetLength = _numericSize(payload, caret);
      packets.push(payload.slice(2 + caret, 2 + packetLength + caret));
      caret = 2 + caret + packetLength;
    }
    return packets;
  }

  frames.push(result);
  return caret;
}

/* Exports -------------------------------------------------------------------*/

export default { serialize, deserialize };
