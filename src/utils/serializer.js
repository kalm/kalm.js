/** Serializer */

'use strict';

/* Methods -------------------------------------------------------------------*/

/**
 * @param {Number} frame The frame id
 * @param {String} channel The channel name
 * @param {Array} packets The list of packets to serialize
 */ 
function serialize(frame, channel, packets) {
  let result = [frame, channel.length];

  for (let letter = 0; letter < channel.length; letter++) {
    result.push(channel.charCodeAt(letter));
  }

  result.push.apply(result, uint16Size(packets.length));

  packets.forEach(packet => {
    result.push.apply(result, uint16Size(packet.length));
    result.push.apply(result, packet);
  });

  return Buffer.from(result);
}

/** @private */
function appendBytes(buffer, bytes) {
  let index = buffer.length;
  const byteLength = bytes.length;
  for (let i = index; i < index + byteLength; i++) {
    buffer[i] = bytes[i - index];
  }
}

/** @private */
function uint16Size(value) {
  return [value >>> 8, value & 0xff];
}

/** @private */
function numericSize(a, b) {
  return (a << 8) | b;
}

/** @private */
function parseFrame(frames, payload, startIndex) {
  const result = {
    frame: payload[startIndex],
    channel: '',
    payloadBytes: payload.length,
    packets: []
  };

  const letters = [];
  const channelLength = payload[startIndex + 1];
  let caret = startIndex + channelLength + 2;

  for (let letter = startIndex + 2; letter < startIndex + channelLength + 2; letter++) {
    letters.push(payload[letter]);
  }
  result.channel = String.fromCharCode.apply(null, letters);

  const totalPackets = numericSize(payload[caret], payload[caret + 1]);

  caret = caret + 2;

  for (let p = 0; p < totalPackets; p++) {
    let packetLength = numericSize(payload[caret], payload[caret + 1]);
    let packet = [];
    for (let byte = caret + 2; byte < packetLength + caret + 2; byte++) {
      packet.push(payload[byte]);
    }
    result.packets.push(packet);

    caret = caret + packetLength + 2;
  }

  frames.push(result);
  return caret;
}

/**
 * @param {UInt8Array} payload The bytes to deserialize
 * @returns {object} The deserialized frames
 */
function deserialize(payload) {
  const frames = [];
  const payloadBytes = payload.length;
  let caret = 0;

  while(caret<payloadBytes) {
    caret = parseFrame(frames, payload, caret);
  }

  return frames;
}

/* Exports -------------------------------------------------------------------*/

module.exports = { serialize, deserialize };