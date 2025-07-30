import sucrase from '@rollup/plugin-sucrase';

export default (async () => ({
	input: 'src/ws.ts',
	plugins: [
		sucrase({
			include: ['src/**'],
			transforms: ['typescript']
		}),
	],
	output: {
		file: 'dist/ws.js',
        name: 'ws',
		format: 'umd',
	}
}))();