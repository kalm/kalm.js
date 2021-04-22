/* eslint-disable */

declare module '@kalm/tcp' {
    interface TCPConfig {
        socketTimeout?: number
    }

    interface KalmTransport {
        (params: any, emitter: NodeJS.EventEmitter): Socket
    }

    type Remote = {
        host: string
        port: number
    }

    type SocketHandle = NodeJS.Socket

    interface Socket {
        bind: () => void
        remote: (handle: SocketHandle) => Remote
        connect: (handle?: SocketHandle) => SocketHandle
        stop: () => void
        send: (handle: SocketHandle, message: number[] | Buffer) => void
        disconnect: (handle: SocketHandle) => void
    }

    export default function tcp(config?: TCPConfig): (config?: TCPConfig) => Transport;
}
