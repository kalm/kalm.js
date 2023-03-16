declare module '@kalm/ws' {
    interface WSConfig {
        cert?: string
        key?: string
        agent?: any
        socketTimeout?: number
    }

    export default function ws(config?: WSConfig): (config?: WSConfig) => any;
}
