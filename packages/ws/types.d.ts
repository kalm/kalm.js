declare module '@kalm/ws' {
  interface WSConfig {
    /** The certificate file content for a secure socket connection, both this and `key` must be set */
    cert?: string
    /** The key file content for a secure socket connection, both this and `cert` must be set */
    key?: string
    /** Indicates wether a server or client should use wss:// protocol. Will throw an error if set without cert or key on the server */
    secure?: boolean
    /** The maximum idle time for the connection before it hangs up (default: 30000) */
    socketTimeout?: number
  }

  /**
     * Creates a websocket Transport
     */
  export default function ws(config?: WSConfig): (config?: WSConfig) => any;
}
