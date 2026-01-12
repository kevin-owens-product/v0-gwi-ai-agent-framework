import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

const eslintConfig = [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'playwright-report/**',
      '*.config.js',
      '*.config.mjs',
      'out/**',
      'build/**',
      'dist/**',
    ],
  },
  // Base ESLint recommended rules
  js.configs.recommended,
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  // React settings
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript for prop validation

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      'prefer-const': 'warn',
      'no-empty-pattern': 'warn',
      'no-constant-binary-expression': 'warn',
    },
  },
];

export default eslintConfig;
