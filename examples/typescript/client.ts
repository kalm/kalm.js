import { connect, routines, Client, Frame } from 'kalm';
import ws from '@kalm/ws';

const client: Client = connect({
  transport: ws(),
  port: 3938,
  routine: routines.realtime(),
});

type MyCustomPayload = {
  foo: string
  message: string
};

client.subscribe('r.evt', (body: MyCustomPayload, frame: Frame) => {
  console.log('Server event', body, frame);
});

client.write('c.evt', 'hello world!');
