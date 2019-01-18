module.exports = {
	transport: 'tcp',
	port: 3001,
	routine: ['dynamic', 200],
	testDuration: 1000 * 10,
	testPayload: { foo: 'bar'},
	testChannel: 'test',
};