declare module '@kalm/ipc' {
interface IPCConfig {
        socketTimeout?: number
        path?: string
    }

    export default function ipc(config?: IPCConfig): (config?: IPCConfig) => any;
}
