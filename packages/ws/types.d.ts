declare module '@kalm/ws' {
  interface WSConfig {
    /** The certificate file content for a secure socket connection, both this and `key` must be set */
    cert?: string
    /** The key file content for a secure socket connection, both this and `cert` must be set */
    key?: string
    /** A custom agent for the http connection, can be used to set proxies or other connection behaviours */
    agent?: any
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout?: number
  }

  /**
     * Creates a websocket Transport
     */
  export default function ws(config?: WSConfig): (config?: WSConfig) => any;
}
