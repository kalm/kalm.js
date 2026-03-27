import sucrase from '@rollup/plugin-sucrase';

export default (async () => ({
  input: 'src/webtransport.ts',
  plugins: [
    sucrase({
      include: ['src/**'],
      transforms: ['typescript'],
    }),
  ],
  output: {
    file: 'dist/webtransport.js',
    name: 'webtransport',
    format: 'es',
  },
}))();
