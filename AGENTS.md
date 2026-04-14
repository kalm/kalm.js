# kalm.js — AI Agent Reference

Kalm is **The Socket Optimizer** — a real-time, multi-transport networking library for Node.js that improves throughput by intelligently batching socket packets before sending them. It provides a unified API across TCP, UDP, WebSocket, and IPC protocols with zero dependencies and a ~5 kb bundle.

---

## Packages

This is an npm-workspaces monorepo. Install the core package plus exactly one transport:

| Package | Purpose |
|---|---|
| `kalm` | Core library — `listen`, `connect`, `routines` |
| `@kalm/tcp` | TCP transport |
| `@kalm/udp` | UDP transport |
| `@kalm/ws` | WebSocket transport (supports WSS, browser, Node 22+ native WS) |
| `@kalm/ipc` | IPC (Unix socket) transport |

```bash
npm install kalm @kalm/ws   # example: WebSocket
```

---

## Critical Rule

**Always pass both `transport` and `routine` explicitly when calling `listen()` or `connect()`.**

- `transport` has no default and will throw if omitted.
- `routine` defaults to `realtime()` if omitted, which disables batching and loses the main benefit of the library.

```typescript
// WRONG — routine is missing
const server = listen({ transport: ws(), port: 8800 });

// WRONG — transport is not invoked (must be called as a function)
const server = listen({ transport: ws, routine: routines.tick({ hz: 5 }), port: 8800 });

// CORRECT
const server = listen({ transport: ws(), routine: routines.tick({ hz: 5 }), port: 8800 });
```

---

## Scaffolding

### WebSocket Server

```typescript
import { listen, routines } from 'kalm';
import ws from '@kalm/ws';

type Payload = { message: string };

const server = listen({
  transport: ws(),
  routine: routines.tick({ hz: 5 }),
  host: '0.0.0.0',
  port: 8800,
});

server.on('ready', () => console.log('Server listening on port 8800'));

server.on('connection', (client) => {
  client.subscribe<Payload>('channel', (body, context) => {
    console.log('Received:', body.message, 'from frame', context.frame.id);
  });

  server.broadcast<Payload>('channel', { message: 'A new client connected' });
});

server.on('error', (err: Error) => console.error('Server error:', err));
```

### WebSocket Client

```typescript
import { connect, routines } from 'kalm';
import ws from '@kalm/ws';

type Payload = { message: string };

const client = connect({
  transport: ws(),
  routine: routines.realtime(),
  host: 'localhost',
  port: 8800,
});

client.on('connect', () => {
  client.subscribe<Payload>('channel', (body, context) => {
    console.log('Received:', body.message);
  });

  client.write('channel', { message: 'hello from client' } as Payload);
});

client.on('disconnect', () => console.log('Disconnected from server'));
client.on('error', (err: Error) => console.error('Client error:', err));
```

### TCP Server

```typescript
import { listen, routines } from 'kalm';
import tcp from '@kalm/tcp';

type Payload = { data: string };

const server = listen({
  transport: tcp(),
  routine: routines.dynamic({ maxInterval: 100, maxPackets: 50 }),
  host: '0.0.0.0',
  port: 3000,
});

server.on('ready', () => console.log('TCP server ready on port 3000'));

server.on('connection', (client) => {
  client.subscribe<Payload>('events', (body, context) => {
    console.log('Event:', body.data);
    client.write('ack', { data: 'ok' });
  });
});

server.on('error', (err: Error) => console.error(err));
```

### TCP Client

```typescript
import { connect, routines } from 'kalm';
import tcp from '@kalm/tcp';

type Payload = { data: string };

const client = connect({
  transport: tcp(),
  routine: routines.dynamic({ maxInterval: 100, maxPackets: 50 }),
  host: 'localhost',
  port: 3000,
});

client.on('connect', () => {
  client.subscribe<Payload>('ack', (body) => console.log('Ack:', body.data));
  client.write('events', { data: 'hello' } as Payload);
});

client.on('error', (err: Error) => console.error(err));
```

### UDP Server

```typescript
import { listen, routines } from 'kalm';
import udp from '@kalm/udp';

type Payload = { value: number };

const server = listen({
  transport: udp(),
  routine: routines.tick({ hz: 20 }),
  host: '0.0.0.0',
  port: 5000,
});

server.on('ready', () => console.log('UDP server ready on port 5000'));

server.on('connection', (client) => {
  client.subscribe<Payload>('updates', (body) => {
    console.log('Update:', body.value);
  });
});

server.on('error', (err: Error) => console.error(err));
```

### UDP Client

```typescript
import { connect, routines } from 'kalm';
import udp from '@kalm/udp';

type Payload = { value: number };

const client = connect({
  transport: udp(),
  routine: routines.tick({ hz: 20 }),
  host: 'localhost',
  port: 5000,
});

client.on('connect', () => {
  setInterval(() => {
    client.write('updates', { value: Math.random() } as Payload);
  }, 50);
});

client.on('error', (err: Error) => console.error(err));
```

### IPC Server

```typescript
import { listen, routines } from 'kalm';
import ipc from '@kalm/ipc';

type Payload = { task: string };

const server = listen({
  transport: ipc(),
  routine: routines.dynamic({ maxInterval: 50 }),
  host: 'my-app',  // IPC uses this as the socket file name
  port: 0,
});

server.on('ready', () => console.log('IPC server ready'));

server.on('connection', (client) => {
  client.subscribe<Payload>('jobs', (body) => {
    console.log('Job received:', body.task);
    client.write('results', { task: `${body.task} done` });
  });
});

server.on('error', (err: Error) => console.error(err));
```

### IPC Client

```typescript
import { connect, routines } from 'kalm';
import ipc from '@kalm/ipc';

type Payload = { task: string };

const client = connect({
  transport: ipc(),
  routine: routines.dynamic({ maxInterval: 50 }),
  host: 'my-app',  // Must match server host
  port: 0,
});

client.on('connect', () => {
  client.subscribe<Payload>('results', (body) => console.log('Result:', body.task));
  client.write('jobs', { task: 'process-data' } as Payload);
});

client.on('error', (err: Error) => console.error(err));
```

---

## Choosing a Routine

| Routine | When to use | Example |
|---|---|---|
| `routines.realtime()` | Latency is critical, low message volume, clients sending sparse events | Client-side input, low-frequency sensors |
| `routines.tick({ hz })` | Synchronized update loop, consistent cadence matters (e.g. game state) | Game servers at 20–60 Hz, data streams |
| `routines.dynamic({ maxInterval, maxPackets?, maxBytes? })` | High and variable traffic, want automatic flush on threshold | Event pipelines, mixed-load servers |
| `manual()` | Full control over when packets are sent | Custom game loops, external scheduler |

`tick` flushes on a fixed clock interval. `dynamic` flushes whichever limit is hit first: elapsed time, packet count, or byte count. `realtime` flushes immediately on every write.

**`tick` seed parameter:** Pass `seed: Date.now()` to synchronize flush timing across multiple server instances so their frames align.

```typescript
// Synchronized across nodes
routine: routines.tick({ hz: 60, seed: Date.now() })
```

### Manual Routine

`manual` is a special case — it is imported directly and returns `{ flush, queue }`. Pass `queue` as the `routine`:

```typescript
import { listen } from 'kalm';
import tcp from '@kalm/tcp';
import { manual } from 'kalm/src/routines/manual'; // direct import

const manualRoutine = manual();

const server = listen({
  transport: tcp(),
  routine: manualRoutine.queue,
  host: '0.0.0.0',
  port: 3000,
});

// Call flush() whenever you want to send buffered packets
setInterval(() => manualRoutine.flush(), 33); // ~30fps
```

---

## API Reference

### `listen(options): Server`

| Option | Type | Default | Description |
|---|---|---|---|
| `transport` | `KalmTransport` | **required** | Transport factory, e.g. `ws()`, `tcp()` |
| `routine` | `KalmRoutine` | `realtime()` | Buffering strategy |
| `port` | `number` | `3000` | Port to bind |
| `host` | `string` | `'0.0.0.0'` | Host to bind |
| `label` | `string` | random | Identifier for logging |
| `json` | `boolean` | `true` | Parse messages as JSON; `false` yields `Uint8Array` |
| `socket` | `any` | — | Existing socket object (for library interop) |

### `connect(options): Client`

Same options as `listen`. `host` and `port` refer to the remote server.

### Server methods & events

```typescript
server.broadcast(channel: string, payload)   // Send to all connected clients
server.stop()                                 // Stop listening and disconnect all clients
server.connections                            // Array of connected Client instances

server.on('ready', () => {})                  // Server is listening
server.on('connection', (client) => {})       // New client connected
server.on('error', (err) => {})               // Error on server or any client
```

### Client methods & events

```typescript
client.write(channel: string, message)         // Buffer a message for sending
client.subscribe<T>(channel, (body: T, context: Context) => {})  // Register handler
client.unsubscribe(channel, handler?)          // Remove handler (all if no handler given)
client.disconnect()                            // Close the connection
client.remote                                  // { host, port } of the remote peer
client.local                                   // { host, port } of the local end (server-side clients only)

client.on('connect', () => {})                 // Connected to server
client.on('disconnect', () => {})              // Connection closed
client.on('frame', ({ body, payloadBytes }) => {}) // Raw frame received (for protocol debugging)
client.on('error', (err) => {})               // Connection error
```

### Context object

Passed as the second argument to every `subscribe` handler:

```typescript
type Context = {
  client: Client
  frame: {
    channel: string    // Channel name
    id: number         // Frame ID (0 to 0xffffffff, then cycles)
    messageIndex: number  // Index of this message within the frame
    payloadBytes: number  // Total bytes in this frame
    payloadMessages: number // Total messages in this frame
  }
}
```

### Binary mode

Set `json: false` to skip JSON parsing. Messages arrive as `Uint8Array`:

```typescript
const server = listen({
  transport: tcp(),
  routine: routines.tick({ hz: 10 }),
  json: false,
  port: 3000,
});

server.on('connection', (client) => {
  client.subscribe('data', (body: Uint8Array) => {
    console.log('Raw bytes:', body);
  });
});
```

---

## Troubleshooting

### `Unable to create Kalm client, missing "transport" parameter`

Transport was not provided. Always pass a transport factory function:
```typescript
// Wrong
listen({ routine: routines.tick({ hz: 5 }), port: 8800 });
// Correct
listen({ transport: ws(), routine: routines.tick({ hz: 5 }), port: 8800 });
```

### `Transport is not a function`

Transport was referenced but not called. Transport factories must be invoked:
```typescript
// Wrong — passing the function reference
listen({ transport: ws, routine: routines.tick({ hz: 5 }), port: 8800 });
// Correct — calling it to produce the transport
listen({ transport: ws(), routine: routines.tick({ hz: 5 }), port: 8800 });
```

### `Transport is not valid, it may not have been invoked`

The transport object returned by the factory is invalid or malformed. Check that you are importing from the correct package and using a supported version.

### Messages are not arriving / high latency on the receiver

If using `tick` or `dynamic`, messages are buffered and only sent when the routine flushes. This is expected behaviour. To send immediately switch to `realtime()`, or tune `hz`/`maxInterval` to flush more often.

### Messages are arriving as `Uint8Array` instead of objects

`json` is set to `false`. Set `json: true` (the default) to have kalm parse payloads as JSON automatically.

### `Option "hostname" does not exist, did you mean "host"?`

Use `host`, not `hostname`. Kalm logs a warning but does not throw.

### No messages received on a channel

Check that the channel name used in `subscribe` exactly matches the name used in `write`/`broadcast`. Channel names are case-sensitive strings.

### Enabling debug logs

Set the `NODE_DEBUG` environment variable to include `kalm`:

```bash
NODE_DEBUG=kalm node server.js
NODE_DEBUG=net,kalm node server.js  # Also enable Node.js net debug
```

---

## Notes

- **Browser support:** `@kalm/ws` works in browsers. TCP, UDP, and IPC require Node.js.
- **Wrapping an existing socket:** Pass a pre-created socket via the `socket` option to make kalm work alongside other libraries (e.g. `reconnecting-websocket`).
- **Multiple servers:** A single process can run multiple `listen()` instances on different ports and transports simultaneously.
- **Channel names:** Both strings and numbers are valid channel identifiers.
