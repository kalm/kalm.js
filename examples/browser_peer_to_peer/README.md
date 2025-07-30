# WebRTC Peer to Peer example

This example shows how to create a P2P (Peer to Peer) network.

# Requirements

- The clients can run in either the browser or in Node.js.
- The server must run in a Node.js environment.
- NPM or other package manager to install `kalm`, `@kalm/tcp` and `@kalm/ws`
- A means to run a local web server to serve html pages from. Eg: python's SimpleHTTPServer

# Testing

First, let's start the WebSocket server, which enables peer discovery.

```
node ./server.js
```

Clients will connect to this server to advertise to other peers.

Next, we'll launch some clients.

Serve the index.html file from an http server (otherwise you will run into CORS issues). At the root of this repo, run:

```
python -m SimpleHTTPServer
```

OR, if using python 3:

```
python3 -m http.server
```

Open as many browser tabs as desired and navigate to `http://localhost:8000/examples/browser_peer_to_peer/`

Peers should appear in the list and give you the option to connect to them.

