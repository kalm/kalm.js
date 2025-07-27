const kalm = require('kalm');
const ws = require('@kalm/ws');
const tcp = require('@kalm/tcp');

/**
 * Reads this node's config from process arguments
 * A real production application might have this embedded in env variables
 */
const config = { host: process.argv.at(-4), port: process.argv.at(-3) };
const seedConfig = { host: process.argv.at(-2), port: process.argv.at(-1) }; // Apply seed config

/**
 * We'll register a timestamp here to help during gossip negociations
 */
const ts = Date.now();

/**
 * Creates one server to listen for internal gossip and a second, external one to receive messages from clients
 */
const internal = kalm.listen({
  label: 'internal',
  transport: tcp(),
  port: config.port,
  routine: kalm.routines.realtime(),
  host: config.host,
});
const external = kalm.listen({
  label: 'external',
  transport: ws(),
  port: 10000 + Number(config.port),
  routine: kalm.routines.tick({ hz: 120, seed: ts }),
  host: '0.0.0.0',
});

const isSeed = (config.host === seedConfig.host && config.port === seedConfig.port);

/**
 * Lets us know when the node is ready
 */
internal.on('ready', () => console.log(`Node is ready ${config.host}:${config.port} (seed = ${isSeed})`));
external.on('ready', () => console.log('Node is ready for client traffic on port', 10000 + Number(config.port)));

/**
 * Non-seed internal nodes will first connect with the seed node using a channel dedicated to this type of gossip. We'll name it "n.add" (for Node Added)
 */
if (!isSeed) {
  console.log(`Connecting to seed node: ${seedConfig.host}:${seedConfig.port}`);
  const seedNode = kalm.connect({
    ...seedConfig,
    transport: tcp(),
    routine: kalm.routines.realtime(),
  });
  seedNode.write('n.add', { host: config.host, ts, port: config.port });

  /**
   * We'll add the seed node to our internal server's connection list manually, this will allow us to broadcast once.
   */
  internal.connections.push(seedNode);

  /**
   * When a non-seed node receives this event, it will attempt to connect to it.
   * We'll just check that we aren't connecting to ourselves
   */
  seedNode.subscribe('n.add', (body) => {
    if (body.port !== config.port || body.host !== config.host) {
      console.log(`Connecting to new node: ${body.host}:${body.port}`);
      const newNode = kalm.connect({
        ...body,
        transport: tcp(),
        routine: kalm.routines.realtime(),
      });

      /**
       * We'll add the new node to our internal server's connection list manually, this will allow us to broadcast once.
       */
      internal.connections.push(newNode);
    }
  });

  seedNode.subscribe('n.evt', (body) => {
    external.broadcast('r.evt', body);
  });
}

internal.on('connection', (client) => {
  /**
   * For internal nodes, we need to listen for any kind of gossip
   */
  if (isSeed) {
    client.subscribe('n.add', (body) => {
      /**
         * When a new node is added, the seed's role is to broadcast the event- since it's already connected to all other nodes, it should reach all server instances.
         */
      console.log(`A new node is joining the cluster: ${body.host}:${body.port}`);
      internal.broadcast('n.add', body);
    });
  }

  /**
     * Server nodes need to broadcast messages they received from gossiping. They listen to an internal channel we'll name "n.evt", for Node Events and broadcast to clients on a channel we'll name "r.evt" for Response Events.
     */
  client.subscribe('n.evt', (body) => {
    external.broadcast('r.evt', body);
  });
});

external.on('connection', (client) => {
  console.log('A new client has connected to this node');
  /**
     * External nodes will listen to client messages on a channel we'll name "c.evt" for Client Event and broadcast it to all nodes, internally and to all clients connected to this node.
     */
  client.subscribe('c.evt', (body) => {
    internal.broadcast('n.evt', body);
    external.broadcast('r.evt', body);
  });
});
