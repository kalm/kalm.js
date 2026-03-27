import nodeExternals from 'rollup-plugin-node-externals';
import sucrase from '@rollup/plugin-sucrase';

export default {
  input: 'src/kalm.ts',
  plugins: [
    nodeExternals(),
    sucrase({
      include: ['src/**'],
      transforms: ['typescript'],
    }),
  ],
  output: {
    file: 'dist/kalm.js',
    name: 'kalm',
    format: 'es',
  },
};
