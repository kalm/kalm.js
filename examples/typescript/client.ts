import {connect, Routines} from 'kalm';
import ws from '@kalm/ws';

const client = connect({
  transport: ws(),
  port: 3938,
  routine: Routines.realtime(),
});

type MyCustomPayload = {
  foo: string
  message: string
};

client.subscribe('r.evt', (body: MyCustomPayload, frame) => {
  console.log('Server event', body, frame);
});

client.write('c.evt', 'hello world!');
