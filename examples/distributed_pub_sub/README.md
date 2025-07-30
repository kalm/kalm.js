# Distributed Pub-Sub example

This example shows how to create a network of multiple servers sharing their messages and relaying them to all thier clients.

This is usefull if you have a very large set of connected clients that you wish to split between many servers.

In this case, clients connect to this server mesh via websocket, yet servers communicate over straight TCP.

# Requirements

- The clients can run in either the browser or in Node.js.
- The server must run in a Node.js environment.
- NPM or other package manager to install `kalm`, `@kalm/tcp` and `@kalm/ws` 

# Testing

Launch any number of servers first, using process arguments to specify the hosts and ports for this node and the seed node.

<hostname> <port> <seed_hostname> <seed_port>

```
node ./server.js 0.0.0.0 3000 0.0.0.0 3000
node ./server.js 0.0.0.0 3001 0.0.0.0 3000
node ./server.js 0.0.0.0 3002 0.0.0.0 3000
```

With this example, three servers are launched, listening on 3 different ports, but all connected to the seed host (port 3000).
The seed acts as an orchestrator and puts nodes in contact with each other. They all end up connected to one another.

In parallel, servers also listen on `port + 10000` for clients to join.

We will now launch clients connecting to any given server.

```
node ./client.js 0.0.0.0 13000
node ./client.js 0.0.0.0 13001
node ./client.js 0.0.0.0 13002
```

The clients should connect to the server and send an "hello world!" message using the external channel.

In turn, the servers will forward this message to the others via an internal channel before each broadcasts it back to its connected clients.


# Diagram
<h3 align="center">
    <img src="https://kalm.js.org/images/distributed.png" alt="peer-to-peer diagram"/>
</h3>