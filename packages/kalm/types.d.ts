interface ClientConfig {
    label?: string
    routine?: KalmRoutine
    json?: Boolean
    transport?: KalmTransport<any>
    port?: number
    host?: string
    isServer?: boolean
    server?: Partial<Server>
}

interface ServerConfig {
    label?: string
    routine?: KalmRoutine
    json?: Boolean
    transport?: KalmTransport<any>
    port?: number
    host?: string
}

type Remote = {
    host: string
    port: number
}

interface ServerEventMap {
    'ready': () => void,
    'connection': (client: Client) => void,
    'error': (error: Error) => void
}

interface ClientEventMap {
    'connect': (client: Client) => void,
    'disconnect': () => void
    'frame': (frame: RawFrame) => void,
    'error': (error: Error) => void
}

interface Server {
    broadcast: (channel: string, message: Serializable) => void
    label: string
    stop: () => void
    connections: Client[]

    on<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k]): this;
    once<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k] | Function): this;
    removeListener<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k] | Function): this;
    off<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k] | Function): this;
}

interface Client {
    write: (channel: string, message: Serializable) => void
    destroy: () => void
    subscribe: (channel: string, handler: (body: any, frame: Frame) => any) => void
    unsubscribe: (channel: string, handler: (body: any, frame: Frame) => any) => void
    local: Remote
    remote: Remote

    on<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k]): this;
    once<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k] | Function): this;
    removeListener<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k] | Function): this;
    off<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k] | Function): this;
}

type Serializable = Buffer | object | string | null

interface KalmRoutine {
    (params: any, routineEmitter: (frameId: number) => any): Queue
}

interface Queue {
    add: (packet: any) => void
    size: () => number
    flush: () => void
}

interface KalmTransport<TransportSocket> {
    (params: ClientConfig, emitter: any): Socket<TransportSocket>
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

interface Socket<TransportSocket> {
    bind: () => void
    remote: (handle: TransportSocket) => Remote
    connect: (handle?: TransportSocket) => TransportSocket
    stop: () => void
    send: (handle: TransportSocket, message: RawFrame) => void
    disconnect: (handle: TransportSocket) => void
    negociate?: (params: { peer: Peer }) => Promise<Peer>
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
    export const listen: (config: ServerConfig) => Server;
    export const connect: (config: ClientConfig) => Client;
    export const routines: {
        tick: (config: { hz: number, seed?: number }) => KalmRoutine
        dynamic: (config: { hz: number, maxPackets?: number, maxBytes?: number }) => KalmRoutine
        realtime: () => KalmRoutine
    };
}
