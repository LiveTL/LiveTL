module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte'],
  },
  plugins: ['svelte3', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 'off',
        'no-multiple-empty-lines': ['error', { max: 2 }],
        '@typescript-eslint/strict-boolean-expressions': 'off',
        'no-sequences': 'off',
      },
    },
  ],
  rules: {
    'comma-dangle': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/space-before-function-paren': ['error', { named: 'never' }],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: true,
      },
    ],
  },
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
};
