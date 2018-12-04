/* Requires ------------------------------------------------------------------*/

import Encrypter from '../utils/encrypter';
import logger from '../utils/logger';
import parser from '../utils/parser';
import { EventEmitter } from 'events';
import { Channel, ClientConfig, RawFrame, Serializable, Serializer, Socket, Client, ByteList, Remote } from '../types';

/* Methods -------------------------------------------------------------------*/

function Client(params: ClientConfig, emitter: EventEmitter, handle?: any): Client {
  let connected: number = 1;
  const channels = {};
  const muWrap = handler => evt => handler(evt[0], evt[1]);
  const encrypter = params.secretKey ? Encrypter(params.secretKey) : null;
  const serializer: Serializer = params.format(params, emitter);
  const socket: Socket = params.transport(params, emitter);

  function write(channel: string, message: Serializable): void {
    return _resolveChannel(channel).queue.add(serializer.encode(message));
  }

  function destroy(): void {
    for (const channel in channels) channels[channel].queue.flush();

    if (connected > 1) setTimeout(() => socket.disconnect(handle), 0);
  }

  function subscribe(channel: string, handler: () => void): void {
    _resolveChannel(channel).emitter.on('message', muWrap(handler));
  }

  function unsubscribe(channel: string, handler: () => void): void {
    if (!(channel in channels)) return;
    _resolveChannel(channel).emitter
        .off('message', muWrap(handler))
        .emit('unsubscribe');
    /*
    // TODO: Clean-up older channels
    if (
        (channels[channel].emitter.listenerCount() === 1) &&
        (channels[channel].queue.size === 0)
    }
    */
  }

  function remote(): Remote {
    if (!handle) return null;
    return socket.remote(handle);
  }

  function local(): Remote {
    return {
      host: params.host,
      port: params.port,
    };
  }

  function _createChannel(channel: string): Channel {
    const channelEmitter: EventEmitter = new EventEmitter();
    return {
        emitter: channelEmitter,
        queue: params.routine(channel, params, channelEmitter),
    };
  }

  function _wrap(event: RawFrame): void {
    let payload: number[] = parser.serialize(event.frameId, event.channel, event.packets);
    if (params.secretKey !== null) payload = encrypter.encrypt(payload);
    socket.send(handle, payload);
  }

  function _resolveChannel(channel: string): Channel {
    if (!(channel in channels)) {
        channels[channel] = _createChannel(channel);
        channels[channel].emitter.on('runQueue', _wrap);
    }
    return channels[channel];
  }

  function _handleConnect(): void {
    connected = 2;
    logger.log(`log: connected to ${params.host}:${params.port}`);
  }

  function _handleError(err: Error): void {
    logger.log(`error: ${err.message}`);
  }

  function _handleRequest(payload: number[]): void {
    const decryptedPayload: ByteList = (encrypter) ? encrypter.decrypt(payload) : payload;
    const frames: RawFrame[] = parser.deserialize(decryptedPayload);
    frames.forEach(frame => frame.packets.forEach((packet, i) => _handlePackets(frame, packet, i)));
  }

  function _handlePackets(frame: RawFrame, packet: ByteList, index: number): void {
    _decode(packet)
      .then(decodedPacket => {
        _resolveChannel(frame.channel).emitter.emit(
          'message',
          [decodedPacket, {
            client: params,
            frame: {
              channel: frame.channel,
              id: frame.frameId,
              messageIndex: index,
              payloadBytes: frame.payloadBytes,
              payloadMessages: frame.packets.length,
            },
            stats: {},
          }]);
      });
  }

  function _decode(packet: ByteList) {
    return new Promise(resolve => {
      resolve((params.format !== null) ? serializer.decode(packet) : packet);
    })
      .catch(err => {
        logger.log(`error: could not deserialize packet ${err}`);
        return packet;
      });
  }

  function _handleDisconnect() {
    connected = 0;
    logger.log(`log: lost connection to ${params.host}:${params.port}`);
  }

  emitter.on('connect', _handleConnect);
  emitter.on('disconnect', _handleDisconnect);
  emitter.on('error', _handleError);
  emitter.on('frame', _handleRequest);
  if (!handle) {
    handle = socket.connect();
  }

  return Object.assign(emitter, { write, destroy, subscribe, unsubscribe, remote, local });
}

/* Exports -------------------------------------------------------------------*/

export = Client;
