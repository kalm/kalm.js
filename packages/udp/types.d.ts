declare module '@kalm/udp' {
  interface UDPConfig {
    /** The udp socket family (default: udp4) */
    type?: 'udp4' | 'udp6'
    /** The ip address that shows up when calling `local()` (default: '0.0.0.0') */
    localAddr?: string
    /** UDP reuse Address seting (default: false) */
    reuseAddr?: boolean
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout?: number
  }

  /**
     * Creates a UDP Transport
     */
  export default function udp(config?: UDPConfig): (config?: UDPConfig) => any;
}
