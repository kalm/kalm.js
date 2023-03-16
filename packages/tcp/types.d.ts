declare module '@kalm/tcp' {
    interface TCPConfig {
        socketTimeout?: number
    }

    export default function tcp(config?: TCPConfig): (config?: TCPConfig) => any;
}
