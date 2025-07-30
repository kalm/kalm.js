import sucrase from '@rollup/plugin-sucrase';

export default {
	input: 'src/udp.ts',
	plugins: [
        sucrase({
            include: ['src/**'],
            transforms: ['typescript']
        }),
	],
    external: ['dgram'],
	output: {
		file: 'dist/udp.js',
        name: 'udp',
		format: 'umd'
	}
};