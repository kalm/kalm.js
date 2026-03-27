import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import spacing from '@stylistic/eslint-plugin';

export default tseslint.config(
  tseslint.configs.recommended,
  spacing.configs.recommended,
  {
    rules: {
      '@stylistic/semi': [2, 'always'],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-require-imports': 1,
    },
  },
  globalIgnores(['**/bin', '**/dist', '**/*.js']),
);
