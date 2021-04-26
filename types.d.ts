/* eslint-disable */

interface ClientConfig {
    label?: string
    routine?: KalmRoutine
    json?: Boolean
    transport?: KalmTransport
    port?: number
    host?: string
    isServer?: boolean
    provider?: any
}

interface ProviderConfig {
    label?: string
    routine?: KalmRoutine
    json?: Boolean
    transport?: KalmTransport
    port?: number
    host?: string
}

type Remote = {
    host: string
    port: number
}

interface Provider extends NodeJS.EventEmitter {
    broadcast: (channel: string, message: Serializable) => void
    label: string
    stop: () => void
    connections: Client[]
}

interface Client extends NodeJS.EventEmitter {
    write: (channel: string, message: Serializable) => void
    destroy: () => void
    subscribe: (channel: string, handler: (body: any, frame: Frame) => any) => void
    unsubscribe: (channel: string, handler: (body: any, frame: Frame) => any) => void
    local: Remote
    remote: Remote
}

type Channel = {
    name: string
    packets: any[]
    handlers: Function[]
}

type ChannelList = {
    [key: string]: Channel
}

type Serializable = Buffer | object | string | null

type UDPSocketHandle = {
    socket: any
    port: number
    host: string
}
type UDPClient = {
    client: Client
    timeout: NodeJS.Timeout
    data: Buffer[]
}
type UDPClientList = {
    [key: string]: UDPClient
}

type SocketHandle = NodeJS.Socket | UDPSocketHandle | WebSocket

interface KalmRoutine {
    (params: any, routineEmitter: NodeJS.EventEmitter): Queue
}
interface Queue {
    add: (packet: any) => void
    flush: () => void
    emitter: NodeJS.EventEmitter
}

interface KalmTransport {
    (params: any, emitter: NodeJS.EventEmitter): Socket
}
interface Socket {
    bind: () => void
    remote: (handle: SocketHandle) => Remote
    connect: (handle?: SocketHandle) => SocketHandle
    stop: () => void
    send: (handle: SocketHandle, message: RawFrame) => void
    disconnect: (handle: SocketHandle) => void
}

interface IPCConfig {
    socketTimeout?: number
    path?: string
}

interface TCPConfig {
    socketTimeout?: number
}

interface UDPConfig {
  type?: string
  localAddr?: string
  reuseAddr?: boolean
  socketTimeout?: number
  connectTimeout?: number
}

interface WSConfig {
    cert?: string
    key?: string
    secure?: boolean
}

type Peer = {
    candidate?: {
        candidate: string
        sdpMLineIndex: number
        sdpMid: string
    }
    type?: 'offer' | 'answer'
    sdp?: string
}

interface WebRTCConfig {
    peers?: Peer[]
}

type RawFrame = {
    frameId: number
    channels: { [channelName: string]: Buffer[] }
}

type Frame = {
    client: Client
    channel: string
    frame: {
      id: number
      messageIndex: number
      payloadBytes: number
      payloadMessages: number
    }
}

declare module 'kalm' {
    export const listen: (config: ProviderConfig) => Provider;
    export const connect: (config: ClientConfig) => Client;
    export const routines: {
        tick: (config: { hz: number, seed?: number }) => KalmRoutine
        dynamic: (config: { hz: number, maxPackets?: number, maxBytes?: number }) => KalmRoutine
        realtime: () => KalmRoutine
    };
}
