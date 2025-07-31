# Binary messages and compression example

This example shows how to send binary messages and how to add compression.

# Requirements

- The clients can run in either the browser or in Node.js.
- The server must run in a Node.js environment.
- NPM or other package manager to install `kalm`, `@kalm/ws` and the compression library of your choice. In this example, we are using `snappy`.

# Testing

Launch the server first:

```
node ./server.js
```

It should log that the server is ready to receive new connections. At this stage, launch any number of clients:

```
node ./client.js
```

The clients should connect to the server and send an "hello world!" message.

In turn, the server will both respond to that client: "hello from the server!" and broadcast to all clients "A new client has connected!"
