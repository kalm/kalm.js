declare module '@kalm/tcp' {
    interface TCPConfig {
        /** The maximum idle time for the connection before it hangs up */
        socketTimeout?: number
    }

    /**
     * Creates a TCP Transport
     */
    export default function tcp(config?: TCPConfig): (config?: TCPConfig) => any;
}
