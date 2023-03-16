declare module '@kalm/udp' {
    interface UDPConfig {
        type?: string
        localAddr?: string
        reuseAddr?: boolean
        socketTimeout?: number
        connectTimeout?: number
    }

    export default function udp(config?: UDPConfig): (config?: UDPConfig) => any;
}
