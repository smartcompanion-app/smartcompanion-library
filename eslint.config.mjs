import storybook from "eslint-plugin-storybook";
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import stencil from '@stencil/eslint-plugin';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/loader/**'] },
  tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    ...stencil.configs.flat.recommended,
    languageOptions: {
      ...stencil.configs.flat.recommended.languageOptions,
      parserOptions: {
        ...stencil.configs.flat.recommended.languageOptions?.parserOptions,
        project: './packages/ui/tsconfig.json',
      },
    },
  },
  {
    files: ['packages/ui/src/**/*.{test,spec,snapshot,browser}.{ts,tsx}'],
    rules: {
      'stencil/ban-side-effects': 'off',
    },
  },
  storybook.configs["flat/recommended"]
);
