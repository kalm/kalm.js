/** 
 * Serializer
 * @namespace {object} Internal/Serializer
 */

'use strict';

/* Methods -------------------------------------------------------------------*/

/**
 * Serializes a frame
 * @memberof Internal/Serializer
 * @param {Number} frame The frame id
 * @param {String} channel The channel name
 * @param {Array} packets The list of packets to serialize
 */ 
function serialize(frame, channel, packets) {
  const channelLen = channel.length;
  let result = [frame % 255, channelLen];

  for (let letter = 0; letter < channelLen; letter++) {
    result.push(channel.charCodeAt(letter));
  }

  result.push.apply(result, uint16Size(packets.length));

  packets.forEach(packet => {
    if (packet.splice === undefined && !(packet instanceof Buffer)) {
      throw new Error(`
        Cannot send unexpected type ${packet.constructor.name} \`${JSON.stringify(packet)}\`.
        Verify Serializer output or send data of type Buffer or UInt8Array
      `);
    }
    result.push.apply(result, uint16Size(packet.length));
    result.push.apply(result, packet);
  });

  return Buffer.from(result);
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
  const channelLength = payload[1 + startIndex];
  let caret = 2 + startIndex + channelLength;

  for (let letter = 2 + startIndex; letter < 2 + startIndex + channelLength; letter++) {
    letters.push(payload[letter]);
  }
  result.channel = String.fromCharCode.apply(null, letters);

  const totalPackets = numericSize(payload[caret], payload[1 + caret]);

  caret = 2 + caret;

  for (let p = 0; p < totalPackets; p++) {
    let packetLength = numericSize(payload[caret], payload[1 + caret]);
    let packet = [];
    for (let byte = 2 + caret; byte < 2 + packetLength + caret; byte++) {
      packet.push(payload[byte]);
    }
    result.packets.push(packet);

    caret = 2 + caret + packetLength;
  }

  frames.push(result);
  return caret;
}

/**
 * Reads a frame
 * @memberof Internal/Serializer
 * @param {UInt8Array} payload The bytes to deserialize
 * @returns {object} The deserialized frames
 */
function deserialize(payload) {
  const frames = [];
  const payloadBytes = payload.length;
  let caret = 0;

  while(caret < payloadBytes) {
    caret = parseFrame(frames, payload, caret);
  }

  return frames;
}

/* Exports -------------------------------------------------------------------*/

module.exports = { serialize, deserialize };