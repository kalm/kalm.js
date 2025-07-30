module.exports = {
  transport: 'tcp',
  port: 3001,
  routine: ['dynamic', { maxInterval: 5 }],
  testDuration: 1000 * 10,
  testPayload: { foo: 'bar' },
  testChannel: 'test',
};
