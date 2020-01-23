declare module '@kalm/ipc' {
    interface IPCConfig {
        socketTimeout?: number
        path?: string
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

    export default function ipc(config?: IPCConfig): (config?: IPCConfig) => Transport;
}
