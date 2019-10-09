import { listen, routines, Provider, Client, Frame } from 'kalm';
import ws from '@kalm/ws';

const provider: Provider = listen({
  transport: ws(),
  port: 3938,
  routine: routines.tick(5),
  host: '0.0.0.0',
});

type MyCustomPayload = {
  foo: string
  message: string
};

provider.on('connection', (client: Client) => {
  client.subscribe('foo', (body: MyCustomPayload, frame: Frame) => {
    console.log('Client event', body, frame);
  });

  const payload: MyCustomPayload = {
    foo: 'bar',
    message: 'hello from the server!',
  };
  
  client.write('foo', payload);
});
  