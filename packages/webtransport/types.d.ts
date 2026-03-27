declare module '@kalm/webtransport' {
  interface WSConfig {
    /** The certificate file content for a secure socket connection */
    cert?: string
    /** The private key file content for a secure socket connection */
    key?: string
    /** The secret to use for the connection. Will throw an error if created without cert, key or secret on the server */
    secret?: string
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout?: number
  }

  /**
     * Creates a WebTransport transport
     */
  export default function webtransport(config?: WSConfig): (config?: WSConfig) => any;
}
