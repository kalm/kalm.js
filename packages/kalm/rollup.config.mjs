import resolve from '@rollup/plugin-node-resolve';
import sucrase from '@rollup/plugin-sucrase';

export default {
	input: 'src/kalm.ts',
	plugins: [
		resolve({
			extensions: ['.ts'],
			preferBuiltins: true,
			browser: true,
		}),
		sucrase({
			include: ['src/**'],
			transforms: ['typescript']
		}),
	],
	output: {
		file: 'dist/kalm.js',
        name: 'kalm',
		format: 'umd'
	}
};