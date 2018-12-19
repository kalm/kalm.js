/* Requires ------------------------------------------------------------------*/

import logger from '../utils/logger';
import parser from '../utils/parser';
import { EventEmitter } from 'events';
import {
  Channel,
  ClientConfig,
  RawFrame,
  Serializable,
  Socket,
  Client,
  Remote,
  Frame,
  SocketHandle,
  ChannelList,
} from '../../../../types';

/* Methods -------------------------------------------------------------------*/

function Client(params: ClientConfig, emitter: EventEmitter, handle?: SocketHandle): Client {
  let connected: number = 1;
  const channels: ChannelList = {};
  const muWrap = handler => evt => handler(evt[0], evt[1]);
  const socket: Socket = params.transport(params, emitter);
  emitter.setMaxListeners(50);

  function write(channel: string, message: Serializable): void {
    emitter.emit('stats.packetWrite');
    return _resolveChannel(channel).queue.add(params.json === true ? Buffer.from(JSON.stringify(message)) : message as Buffer);
  }

  function destroy(): void {
    for (const channel in channels) channels[channel].queue.flush();
    if (connected > 1) setTimeout(() => socket.disconnect(handle), 0);
  }

  function subscribe(channel: string, handler: <T extends Serializable>(msg: T, frame: Frame) => void): void {
    _resolveChannel(channel).emitter.on('message', muWrap(handler));
  }

  function unsubscribe(channel: string, handler: () => void): void {
    if (!(channel in channels)) return;
    _resolveChannel(channel).emitter
        .off('message', muWrap(handler))
        .emit('unsubscribe');

    if (channels[channel].emitter.listenerCount('message') === 0) {
      channels[channel].queue.flush();
      delete channels[channel];
    }
  }

  function remote(): Remote {
    if (params.isServer) return socket.remote(handle);
    return {
      host: params.host,
      port: params.port,
    };
  }

  function local(): Remote {
    if (params.isServer) {
      return {
        host: params.host,
        port: params.port,
      };
    }
    return null;
  }

  function _createChannel(channel: string): Channel {
    const channelEmitter: EventEmitter = new EventEmitter();

    return {
        emitter: channelEmitter,
        queue: params.routine(channel, params, channelEmitter),
    };
  }

  function _wrap(event: RawFrame): void {
    const payload: number[] = parser.serialize(event.frameId, event.channel, event.packets);
    emitter.emit('stats.packetReady');
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

  function _handleRequest(payload: Buffer): void {
    emitter.emit('stats.packetReceived');
    const frame: RawFrame = parser.deserialize(payload);
    frame.packets.forEach((packet, i) => _handlePackets(frame, packet, i));
  }

  function _handlePackets(frame: RawFrame, packet: Buffer, index: number): Promise<void> {
    if (packet.length === 0) return;
    const decodedPacket = (params.json === true) ? JSON.parse(packet.toString()) : packet;
    emitter.emit('stats.packetDecoded');
    if (channels[frame.channel]) {
      channels[frame.channel].emitter.emit(
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
        }]);
    }
  }

  function _handleDisconnect() {
    connected = 0;
    logger.log(`log: lost connection to ${params.host}:${params.port}`);
  }

  emitter.on('connect', _handleConnect);
  emitter.on('disconnect', _handleDisconnect);
  emitter.on('error', _handleError);
  emitter.on('frame', _handleRequest);
  if (!handle) logger.log(`log: connecting to ${params.host}:${params.port}`);
  handle = socket.connect(handle);

  return Object.assign(emitter, { write, destroy, subscribe, unsubscribe, remote, local, label: params.label });
}

/* Exports -------------------------------------------------------------------*/

export default Client;
