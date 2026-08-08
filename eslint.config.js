import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/src/html/**/*.html',
      '**/src/plugins/jquery-ui-bundle.js',
      '**/src/plugins/jquery.js',
      '**/src/plugins/vuetify.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,ts,svelte}'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        ...globals.jest,
        __BROWSER__: 'readonly',
        __VERSION__: 'readonly',
        __MV__: 'readonly',
        Ytc: 'readonly',
        Ltl: 'readonly',
        NodeJS: 'readonly',
      },
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-empty': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-constant-binary-expression': 'off',
      'no-useless-assignment': 'off',
      'svelte/no-at-html-tags': 'off',
      'svelte/a11y-click-events-have-key-events': 'off',
      'svelte/a11y-no-static-element-interactions': 'off',
      'svelte/infinite-reactive-loop': 'off',
      'svelte/no-inner-declarations': 'off',
      'svelte/no-immutable-reactive-statements': 'off',
      'svelte/no-reactive-reassign': 'off',
      'svelte/no-store-async': 'off',
      'svelte/no-unused-svelte-ignore': 'off',
      'svelte/prefer-svelte-reactivity': 'off',
      'svelte/require-each-key': 'off',
      'no-unassigned-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/{postcss,svelte,tailwind}.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.commonjs,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/utils/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.commonjs,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
