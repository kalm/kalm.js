/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { log } from '../utils/logger';
import { serializeLegacy, deserializeLegacy, indiceBuffer } from '../utils/parser';

/* Methods -------------------------------------------------------------------*/

export function Client(params: ClientConfig, emitter: NodeJS.EventEmitter, handle?: SocketHandle): Client {
  let connected: number = 1;
  const channels: ChannelList = {};
  const socket: Socket = params.transport(params, emitter);

  if (!socket.connect) throw new Error('Transport is not valid, it may not have been invoked, see: https://github.com/kalm/kalm.js#documentation');

  function _createChannel(channel: string): Channel {
    const channelEmitter: NodeJS.EventEmitter = new EventEmitter();

    return {
      name: channel,
      emitter: channelEmitter,
      queue: params.routine(channel, params, channelEmitter, emitter),
      channelBuffer: Buffer.concat([indiceBuffer(channel.length), Buffer.from(channel)]),
    };
  }

  function _wrap(event: RawFrame): void {
    const payload: Buffer = params.framing === 'kalm' ? serializeLegacy(event.frameId, channels[event.channel], event.packets) : Buffer.from(JSON.stringify({ frameId: event.frameId, channel: event.channel, packets: event.packets }));
    socket.send(handle, payload);
  }

  function _resolveChannel(channel: string): Channel {
    if (!(channel in channels)) {
      channels[channel] = _createChannel(channel);
      channels[channel].emitter.on('runQueue', _wrap);
    }
    return channels[channel];
  }

  function _handlePackets(frame: RawFrame, packet: Buffer, index: number): Promise<void> {
    if (packet.length === 0) return;
    const decodedPacket = (params.json === true) ? JSON.parse(packet.toString()) : packet;
    if (channels[frame.channel]) {
      channels[frame.channel].emitter.emit(
        'message',
        decodedPacket,
        {
          client: params,
          frame: {
            channel: frame.channel,
            id: frame.frameId,
            messageIndex: index,
            payloadBytes: frame.payloadBytes,
            payloadMessages: frame.packets.length,
          },
        },
      );
    }
  }

  function getChannels() {
    return Object.keys(channels);
  }

  function _handleConnect(): void {
    connected = 2;
    log(`connected to ${params.host}:${params.port}`);
  }

  function _handleError(err: Error): void {
    log(`error ${err.message}`);
  }

  function _handleRequest(payload: Buffer): void {
    const frame: RawFrame = params.framing === 'kalm' ? deserializeLegacy(payload) : JSON.parse(payload.toString());
    emitter.emit('frame', frame);
    frame.packets.forEach((packet, i) => _handlePackets(frame, packet, i));
  }

  function _handleDisconnect() {
    connected = 0;
    log(`lost connection to ${params.host}:${params.port}`);
  }

  function write(channel: string, message: Serializable): void {
    return _resolveChannel(channel)
      .queue.add(params.json === true ? Buffer.from(JSON.stringify(message)) : message as Buffer);
  }

  function destroy(): void {
    Object.keys(channels).forEach(channel => channels[channel].queue.flush());
    if (connected > 1) setTimeout(() => socket.disconnect(handle), 0);
  }

  function subscribe(channel: string, handler: (msg: any, frame: Frame) => void): void {
    _resolveChannel(channel).emitter.on('message', handler);
  }

  function unsubscribe(channel: string, handler?: (msg: any, frame: Frame) => void): void {
    if (!(channel in channels)) return;
    if (handler) channels[channel].emitter.off('message', handler);
    else channels[channel].emitter.removeAllListeners('message');
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

  emitter.on('connect', _handleConnect);
  emitter.on('disconnect', _handleDisconnect);
  emitter.on('error', _handleError);
  emitter.on('rawFrame', _handleRequest);
  if (!handle) log(`connecting to ${params.host}:${params.port}`);
  handle = socket.connect(handle);

  return Object.assign(emitter, {
    write,
    destroy,
    subscribe,
    unsubscribe,
    remote,
    local,
    label: params.label,
    getChannels,
  });
}
