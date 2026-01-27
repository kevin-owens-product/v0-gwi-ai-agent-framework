import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Import local rules
import localRules from './eslint-local-rules/index.js';

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
      'eslint-local-rules/**',
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
  // i18n enforcement for TSX files in app/ and components/
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    plugins: {
      'local': localRules,
    },
    rules: {
      // Enable the no-hardcoded-strings rule as a warning
      // Change to 'error' when ready to enforce strictly
      'local/no-hardcoded-strings': ['warn', {
        // Additional allowed strings specific to this project
        allowedStrings: [
          // Brand names
          'GWI', 'GlobalWebIndex', 'Spark',
          // Common UI elements
          'vs', 'or', 'and', 'of',
        ],
        // Props that should be translated
        translatableProps: [
          'placeholder',
          'title',
          'aria-label',
          'alt',
          'label',
          'description',
          'helperText',
          'errorMessage',
          'tooltip',
          'hint',
        ],
      }],
    },
  },
];

export default eslintConfig;
