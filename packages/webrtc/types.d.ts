declare module '@kalm/webrtc' {
    interface WebRTCConfig {
        peers?: Peer[]
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

    interface KalmTransport {
        (params: any, emitter: NodeJS.EventEmitter): Socket
    }

    type Remote = {
        host: string
        port: number
    }

    type SocketHandle = any

    interface Socket {
        bind: () => void
        remote: (handle: SocketHandle) => Remote
        connect: (handle?: SocketHandle) => SocketHandle
        stop: () => void
        send: (handle: SocketHandle, message: number[] | Buffer) => void
        disconnect: (handle: SocketHandle) => void
        negociate: (params: { peer: Peer }) => Promise<Peer>
    }

    export default function ws(config?: WebRTCConfig): (config?: WebRTCConfig) => Transport;
}
