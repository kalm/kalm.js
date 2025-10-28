interface ClientConfig {
  /** Optional name for the client */
  label?: string
  /** The buffering strategy to use for sending messages */
  routine?: KalmRoutine
  /** Wether messages are JSON objects or Buffers. (default: true) */
  json?: boolean
  /** The transport protocol to use. You'll need to install it seperatly ex: @kalm/tcp */
  transport?: KalmTransport
  /** The port to connect to */
  port?: number
  /** The hostname or ip of the server to connect to */
  host?: string
  /** An optional Socket object, this can be useful when combining Kalm with other libraries */
  socket?: any
  /** Internal: Tells if the client has been created by the server */
  isServer?: boolean
  /** Internal: The server object reference for server-created clients */
  server?: Partial<Server>
}

interface ServerConfig {
  /** Optional name for the server */
  label?: string
  /** The buffering strategy to use for sending messages */
  routine?: KalmRoutine
  /** Wether messages are JSON objects or Buffers. (default: true) */
  json?: boolean
  /** The transport protocol to use. You'll need to install it seperatly ex: @kalm/tcp */
  transport?: KalmTransport
  /** The port to listen on */
  port?: number
  /** Optional the hostname or ip of the server */
  host?: string
}

type Remote = {
  host: string
  port: number
};

interface ServerEventMap {
  ready: () => void
  connection: (client: Client) => void
  error: (error: Error) => void
}

interface ClientEventMap {
  connect: () => void
  disconnect: () => void
  disconnected: () => void // Internal use only
  frame: (data: { body: RawFrame, payloadBytes: number }) => void
  error: (error: Error) => void
}

type Serializable = Buffer | object | string | null;

interface KalmRoutine {
  (params: any, routineEmitter: (frameId: number) => any): Queue
}

/** The message queue for a given subscription */
interface Queue {
  add: (packet: any) => void
  size: () => number
  flush: () => void
}

interface KalmTransport {
  (params: any, emitter: any): Socket
}

interface Socket {
  /** The command for a server to start listening for messages */
  bind: () => void
  /** Given a Client, prints the information of the remote party in the connection */
  remote: (handle?: any) => Remote
  /** Initiates the connection to a remote server */
  connect: (handle?: any) => any
  /** The command to stop a server from accepting messages */
  stop: () => void
  /** Given a Client, sends a message to a remote connection */
  send: (handle: any, message: RawFrame) => void
  /** The command to disconnect a Client */
  disconnect: (handle: any) => void
}

/**
 * The raw format of data transferred between Kalm clients and servers. Can be inspected by listening for the `frame` event on a Client
 */
type RawFrame = {
  /** The id of the frame, these are integers cycling from 0 to 0xffffffff */
  frameId: number
  /** The list of channels and their received messages, still as Buffers of bytes */
  channels: { [channelName: string]: Buffer[] }
};

/**
 * The context for a message received
 */
type Context = {
  /** A reference to the Client instance */
  client: Client
  /** The body of the message */
  frame: Frame
};

type Frame = {
  /** The name of the subscription channel */
  channel: string
  /** The id of the frame, these are integers cycling from 0 to 0xffffffff */
  id: number
  /** The position of the message ion the frame */
  messageIndex: number
  /** The number of bytes in the frame */
  payloadBytes: number
  /** The number of messages in the frame */
  payloadMessages: number
};

type TickConfig = {
  /** Interval in Hertz for emitting messages. The value can be translated as the number of emits per second. For example: `hz: 60` means 60 emits per second, or one emit every 16ms */
  hz: number
  /** A timestamp to establish the first tick, can be used to time a group of servers to emit together, or in cascade as wanted */
  seed?: number
};

type DynamicConfig = {
  /** Maximum interval between emits in milliseconds */
  maxInterval: number
  /** Maximum number of messages in the queue */
  maxPackets?: number
  /** Maximum number of total bytes in the queue across all messages */
  maxBytes?: number
};

type RealtimeConfig = {
  /** Option to defer the execution of the emit until the next UV cycle. Can prevent blocking of the execution thread */
  deferred: boolean
};

declare module 'kalm' {
  /**
     * Starts a server instance that listens for incomming connections
     */
  export const listen: (config: ServerConfig) => Server;
  /**
     * Connects to a remote socket server
     */
  export const connect: (config: ClientConfig) => Client;
  /**
     * The list of buffering routines for packets
     */
  export const routines: {
    /**
         * Emits buffered messages on a fixed time interval in Hertz. Can be synced with other servers with the `seed` property
         */
    tick: (config: TickConfig) => KalmRoutine
    /**
         * Emits buffered messages when one of three conditions is met:
         * either the maximum time interval between emits, the maximum number of buffered messages or buffered bytes is reached.
         */
    dynamic: (config: DynamicConfig) => KalmRoutine
    /**
         * Emits messages immediatly as they enter the queue, no buffering
         */
    realtime: (confg?: RealtimeConfig) => KalmRoutine
  };

  /**
   * A socket server instance. When a server receives a request from an initiating
   * client, it creates a matching client instance on it's end, building it's connection pool.
   */
  export interface Server {
    /**
       * Sends a message to all active clients in the connection pool
       *
       * @params channel The channel name for the message, any client with a matching subscription will receive the broadcast
       * @params message The message to be emitted to all active clients in the connection pool
       */
    broadcast: (channel: string, message: Serializable) => void
    /** A unique label or name for the server (optional) */
    label: string
    /** Kills the server and destroys all active clients and their connection */
    stop: () => void
    /** The list of active clients */
    connections: Client[]

    /**
       * Events emitted by the server:
       *
       * 'ready': once the server is ready and accepting new connections
       *
       * 'connection': when a client connects to the server
       *
       * 'error': when an error occurs (non-fatal)
       */
    on<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k]): this
    once<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k]): this
    removeListener<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k]): this
    off<k extends keyof ServerEventMap>(event: k, listener: ServerEventMap[k]): this
    addEventListener<k extends keyof ServerEventMap>(event: k, listener: (evt?: Event) => void): this
    removeEventListener<k extends keyof ServerEventMap>(event: k, listener: (evt?: Event) => void): this
  }

  /**
   * A socket client instance.
   */
  export interface Client {
    /**
       * Writes a message to the remote client
       *
       * @params channel The channel name for the message, given the remote client has a matching subscription
       * @params message The message to be emitted to the remote client
       */
    write: (channel: string, message: Serializable) => void
    /**
       * Kills the connection to the server and destroys the client
       */
    destroy: () => void
    /**
       * Begins listening for messages that are sent to a given channel
       *
       * @param channel The channel name for the subscription
       * @param handler The function to invoke when a new message arrives
       */
    subscribe: (channel: string, handler: (body: any, context: Context) => any) => void
    /**
       * Stops listening for messages that are sent to a given channel
       *
       * @param channel The channel name for the subscription to stop
       * @param handler Optionally, the function to stop invoking. If left empty, will clear all handlers for that subscription
       */
    unsubscribe: (channel: string, handler: (body: any, context: Context) => any) => void
    /**
       * Prints the coordinates of the local client
       */
    local: Remote
    /**
       * Prints the coordinates of the remote client
       */
    remote: Remote

    /**
       * Events emitted by the client:
       *
       * 'connect': once the client has connected to the server
       *
       * 'disconnect': when the client disconnects from the server
       *
       * 'frame': inspects a raw frame as it arrives
       *
       * 'error': when an error occurs (non-fatal)
       */
    on<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k]): this
    once<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k]): this
    removeListener<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k]): this
    off<k extends keyof ClientEventMap>(event: k, listener: ClientEventMap[k]): this
    addEventListener<k extends keyof ClientEventMap>(event: k, listener: (evt?: Event) => void): this
    removeEventListener<k extends keyof ClientEventMap>(event: k, listener: (evt?: Event) => void): this
  }

  /**
   * The context for a message received
   */
  export type Context = {
    /** A reference to the Client instance */
    client: Client
    /** The body of the message */
    frame: Frame
  };
}
