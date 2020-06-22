/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { log } from '../utils/logger';

/* Methods -------------------------------------------------------------------*/

export function Client(params: ClientConfig, emitter: NodeJS.EventEmitter, handle?: SocketHandle): Client {
  let connected: number = 1;
  const channels: {[channel: string]: Channel } = {};
  const routine = params.routine(params, new EventEmitter());
  const socket: Socket = params.transport(params, emitter);
  let totalMessages = 0;

  function _resolveChannel(channelName: string): Channel {
    if (!(channelName in channels)) {
      channels[channelName] = {
        name: channelName,
        packets: [],
        handlers: [],
      };
    }
    return channels[channelName];
  }

  function getChannels() {
    return Object.keys(channels);
  }

  function _wrap(event: any): void {
    socket.send(handle, getChannels().reduce((frame, channelName) => {
      frame.channels[channelName] = channels[channelName].packets;
      return frame;
    }, { frameId: event.frameId, channels: {} }));

    getChannels().forEach(channelName => { channels[channelName].packets.length = 0; });
    totalMessages = 0;
  }

  function _handleConnect(): void {
    connected = 2;
    log(`connected to ${params.host}:${params.port}`);
  }

  function _handleError(err: Error): void {
    log(`error ${err.message}`);
  }

  function _handleRequest(frame: RawFrame, payloadBytes: number): void {
    if (frame && frame.channels) {
      Object.keys(frame.channels).forEach(channelName => {
        frame.channels[channelName].forEach((packet, messageIndex) => {
          channels[channelName].handlers.forEach(handler => handler(
            packet,
            {
              client: params,
              frame: {
                channel: channelName,
                id: frame.frameId,
                messageIndex,
                payloadBytes,
                payloadMessages: frame.channels[channelName].length,
              },
            },
          ));
        });
      });
    }
  }

  function _handleDisconnect() {
    connected = 0;
    log(`lost connection to ${params.host}:${params.port}`);
  }

  function write(channelName: string, message: Serializable): void {
    if (params.json !== true && !Buffer.isBuffer(message)) {
      throw new Error(`Unable to serialize message: ${message}, expected type Buffer`);
    }
    _resolveChannel(channelName).packets.push(message);
    if (++totalMessages >= 0xff) {
      log('Buffer saturated, flushing messages to transport');
      routine.flush();
    } else routine.add(message);
  }

  function destroy(): void {
    routine.flush();
    if (connected > 1) setTimeout(() => socket.disconnect(handle), 0);
  }

  function subscribe(channel: string, handler: (msg: any, frame: Frame) => void): void {
    _resolveChannel(channel).handlers.push(handler);
  }

  function unsubscribe(channelName: string, handler?: (msg: any, frame: Frame) => void): void {
    if (!(channelName in channels)) return;
    if (handler) {
      const index = channels[channelName].handlers.indexOf(handler);
      if (index > -1) channels[channelName].handlers.splice(index, 1);
    } else channels[channelName].handlers = [];

    if (channels[channelName].handlers.length === 0 && channels[channelName].packets.length === 0) delete channels[channelName];
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

  routine.emitter.on('runQueue', _wrap);
  emitter.on('connect', _handleConnect);
  emitter.on('disconnect', _handleDisconnect);
  emitter.on('error', _handleError);
  emitter.on('frame', _handleRequest);
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
