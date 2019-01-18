/* Requires ------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import net from 'net';
import dgram from 'dgram';

/* Types ---------------------------------------------------------------------*/

export type ClientConfig = {
    label?: string
    routine?: Routine
    json?: Boolean
    transport?: Transport
    port?: number
    host?: string
    isServer?: boolean
    provider?: any
}

export type ProviderConfig = {
    label?: string
    routine?: Routine
    json?: Boolean
    transport?: Transport
    port?: number
    host?: string
}

export type Remote = {
    host: string
    port: number
}

export interface Provider extends EventEmitter {
    broadcast: (channel: string, message: Serializable) => void
    label: string
    stop: () => void
    connections: Client[]
}

export interface Client extends EventEmitter {
    write: (channel: string, message: Serializable) => void
    destroy: () => void
    subscribe: (channel: string, handler: () => void) => void
    unsubscribe: (channel: string, handler: () => void) => void
    local: () => Remote
    remote: () => Remote
}

export type Channel = {
    queue: Queue
    emitter: EventEmitter
}

export type ChannelList = {
    [key: string]: Channel
}

export type Serializable = Buffer | object | string | null

export type UDPSocketHandle = {
    socket: dgram.Socket
    port: number
    host: string
}
export type UDPClient = {
    client: Client
    timeout: NodeJS.Timeout
    data: Buffer[]
}
export type UDPClientList = {
    [key: string]: UDPClient
}

export type SocketHandle = net.Socket | UDPSocketHandle | WebSocket

export type Routine = (channel: string, params: object, emitter: EventEmitter) => Queue
export interface Queue {
    add: (packet: Buffer) => void
    size: () => number
    flush: () => void
}

export type Transport = (params: object, emitter: EventEmitter) => Socket
export interface Socket {
    bind: () => void
    remote: (handle: SocketHandle) => Remote
    connect: (handle?: SocketHandle) => SocketHandle
    stop: () => void
    send: (handle: SocketHandle, message: number[] | Buffer) => void
    disconnect: (handle: SocketHandle) => void
}

export type IPCConfig = {
    socketTimeout?: number
    path?: string
}

export type TCPConfig = {
    socketTimeout?: number
}

export type UDPConfig = {
  type?: string
  localAddr?: string
  reuseAddr?: boolean
  socketTimeout?: number
  connectTimeout?: number
}

export type WSConfig = {
    cert?: string
    key?: string
    secure?: boolean
}

export type RawFrame = {
    frameId: number
    channel: string
    packets: Buffer[]
    payloadBytes: number
}

export type Frame = {
    client: Client
    channel: string
    frame: {
      id: number
      messageIndex: number
      payloadBytes: number
      payloadMessages: number
    }
}