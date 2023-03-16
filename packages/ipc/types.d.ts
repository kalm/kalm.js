declare module '@kalm/ipc' {
interface IPCConfig {
        /** The maximum idle time for the connection before it hangs up */
        socketTimeout?: number
        /** The unique path for the IPC file descriptor (Unix only) */
        path?: string
    }

    /**
     * Creates an IPC Transport
     */
    export default function ipc(config?: IPCConfig): (config?: IPCConfig) => any;
}
