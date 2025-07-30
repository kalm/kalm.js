import { EventEmitter } from '../utils/events';
import { log } from '../utils/logger';

export function Client(params: ClientConfig, emitter: EventEmitter, socket?: any): Client {
  let connected = 1;

  type Channel = {
    name: string
    packets: any[]
    handlers: Function[]
  };

  const channels: { [channel: string]: Channel } = {};
  const routine = params.routine(params, _wrap);
  const transport: Socket = params.transport(params, emitter);
  let instance = null;

  const remote: Remote = (params.isServer) ? transport.remote(socket) : { host: params.host, port: params.port };
  const local: Remote = (params.isServer) ? { host: params.host, port: params.port } : null;

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

  function _wrap(frameId: number): void {
    transport.send(socket, getChannels().reduce((frame, channelName) => {
      if (channels[channelName].packets.length > 0) frame.channels[channelName] = channels[channelName].packets;
      return frame;
    }, { frameId, channels: {} }));

    getChannels().forEach((channelName) => { channels[channelName].packets.length = 0; });
  }

  function _handleConnect(): void {
    connected = 2;
    log(`connected to ${params.host}:${params.port}`);
  }

  function _handleError(err: Error): void {
    log(`error ${err.message}`);
  }

  function _handleRequest(frameEvent: { body: RawFrame, payloadBytes: number }): void {
    const frame = frameEvent.body;
    if (frame && frame.channels) {
      Object.keys(frame.channels).forEach((channelName) => {
        frame.channels[channelName].forEach((packet, messageIndex) => {
          if (channelName in channels) {
            channels[channelName].handlers.forEach(handler => handler(
              packet,
              {
                client: instance,
                frame: {
                  channel: channelName,
                  id: frame.frameId,
                  messageIndex,
                  payloadBytes: frameEvent.payloadBytes,
                  payloadMessages: frame.channels[channelName].length,
                },
              },
            ));
          }
        });
      });
    }
  }

  function _handleDisconnect() {
    connected = 0;
    log(`lost connection to ${params.host}:${params.port}`);
    // Gives a change for other internal listeners to run their business logic
    setTimeout(() => emitter.emit('disconnect'), 0);
  }

  function write(channelName: string, message: Serializable): void {
    if (params.json !== true && !Buffer.isBuffer(message)) {
      throw new Error(`Unable to serialize message: ${message}, expected type Buffer`);
    }
    _resolveChannel(channelName).packets.push(message);
    routine.add(message);
  }

  function destroy(): void {
    routine.flush();
    if (connected > 1) setTimeout(() => transport.disconnect(socket), 0);
  }

  function subscribe(channelName: string, handler: (msg: any, frame: Frame) => void): void {
    _resolveChannel(channelName).handlers.push(handler);
  }

  function unsubscribe(channelName: string, handler?: (msg: any, frame: Frame) => void): void {
    if (!(channelName in channels)) return;
    if (handler) {
      const index = channels[channelName].handlers.indexOf(handler);
      if (index > -1) channels[channelName].handlers.splice(index, 1);
    }
    else channels[channelName].handlers = [];

    if (channels[channelName].handlers.length === 0 && channels[channelName].packets.length === 0) delete channels[channelName];
  }

  emitter.on('connect', _handleConnect);
  emitter.on('disconnected', _handleDisconnect);
  emitter.on('error', _handleError);
  emitter.on('frame', _handleRequest);
  if (!socket) log(`connecting to ${params.host}:${params.port}`);
  socket = transport.connect(socket);

  instance = Object.assign(emitter, {
    write,
    destroy,
    subscribe,
    unsubscribe,
    remote,
    local,
    label: params.label,
    getChannels,
  });
  return instance;
}
