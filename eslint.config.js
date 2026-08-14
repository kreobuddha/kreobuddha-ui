import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'storybook-static/', 'coverage/'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', '.storybook/**/*.{ts,tsx}', 'vite.config.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // House style: no `function` declarations, and an explicit return type on anything the
      // module exposes, so a contract is readable at the definition site.
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
