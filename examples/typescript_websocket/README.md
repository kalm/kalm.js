# Typescript example

This example shows how to create a websocket server and client in Typescript.

# Requirements

- The clients can run in either the browser or in Node.js, once transpiled.
- The server must run in a Node.js environment.
- NPM or other package manager to install `kalm` and `@kalm/ws` 

# Testing

Launch the server first:

```
node ./server.ts
```

It should log that the server is ready to receive new connections. At this stage, launch any number of clients:

```
node ./client.ts
```

The clients should connect to the server and send an "hello world!" message.

In turn, the server will both respond to that client: "hello from the server!" and broadcast to all clients "A new client has connected!"
