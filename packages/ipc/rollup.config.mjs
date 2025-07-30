import sucrase from '@rollup/plugin-sucrase';

export default {
	input: 'src/ipc.ts',
	plugins: [
        sucrase({
            include: ['src/**'],
            transforms: ['typescript']
        }),
	],
    external: ['net'],
	output: {
		file: 'dist/ipc.js',
        name: 'ipc',
		format: 'umd'
	}
};