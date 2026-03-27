# Typescript webtransport example

This example shows how to create a webtransport server and client in Typescript.

# Requirements

- The clients must in the browser.
- The server must run in a Node.js environment.
- NPM or other package manager to install `kalm` and `@kalm/webtransport`
- **Important** Generate an ssl certificate for localhost

# Certificate

WebTransport requires servers to have a valid SSL certificate to work. We can generate one for `localhost` using this script ([src repo](https://github.com/moq-dev/moq/blob/261d6927c156ab3efec8f59c75b6e337e7f4d107/cert/generate)): 


```
./cert/mkcert.sh
```

This will output certificate files to that directory.

You will need to grab the SHA-256 fingerprint and place it in the client.html file for `serverCertificateHashes`.

# Testing

Launch the server first:

```
node ./server.ts
```

It should log that the server is ready to receive new connections. Now we need to serve the html file:

```
node ./static_serve.ts 
```

And open as many browser tabs at the address listed by the command. eg: https://localhost:8000/examples/typescript_webtransport/client.html

Each will behave as a distinct client. The clients should connect to the server and send an "hello world!" message.

In turn, the server will both respond to that client: "hello from the server!" and broadcast to all clients "A new client has connected!"
