/* eslint-disable */

declare module '@kalm/udp' {
    interface UDPConfig {
        type?: string
        localAddr?: string
        reuseAddr?: boolean
        socketTimeout?: number
        connectTimeout?: number
    }

    interface KalmTransport {
        (params: any, emitter: NodeJS.EventEmitter): Socket
    }

    type Remote = {
        host: string
        port: number
    }

    type SocketHandle = {
        socket: any
        port: number
        host: string
    }

    interface Socket {
        bind: () => void
        remote: (handle: SocketHandle) => Remote
        connect: (handle?: SocketHandle) => SocketHandle
        stop: () => void
        send: (handle: SocketHandle, message: number[] | Buffer) => void
        disconnect: (handle: SocketHandle) => void
    }

    export default function udp(config?: UDPConfig): (config?: UDPConfig) => Transport;
}
