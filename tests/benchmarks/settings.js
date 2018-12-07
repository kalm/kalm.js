module.exports = {
	transport: 'tcp',
	port: 3000,
	routine: ['dynamic', 90],
	testDuration: 1000 * 3,
	testPayload: { foo: 'bar'},
	testChannel: 'test',
	//secretKey: 'secretkeyshouldbeatleast16chars'
	secretKey: null
};