import sucrase from '@rollup/plugin-sucrase';

export default {
  input: 'src/tcp.ts',
  plugins: [
    sucrase({
      include: ['src/**'],
      transforms: ['typescript'],
    }),
  ],
  external: ['net'],
  output: {
    file: 'dist/tcp.js',
    name: 'tcp',
    format: 'umd',
  },
};
