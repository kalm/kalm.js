import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import jestConfig from 'eslint-plugin-jest';
import spacing from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  jestConfig.configs['flat/recommended'],
  spacing.configs.recommended,
  {
    rules: {
      '@stylistic/semi': [2, 'always'],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-require-imports': 1,
      'jest/no-done-callback': 0,
      'jest/no-conditional-expect': 0,
    },
  },
  globalIgnores(['**/bin', '**/dist', '**/*.js']),
);
