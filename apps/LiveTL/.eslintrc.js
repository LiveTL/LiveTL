module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  parserOptions: {
    ecmaVersion: 12,
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
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'no-multiple-empty-lines': ['error', { max: 2 }],
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        // Causes false positives with reactive and auto subscriptions
        '@typescript-eslint/strict-boolean-expressions': 'off',
        'no-unused-expressions': 'off',
        'no-sequences': 'off',
      },
    },
  ],
  rules: {
    // Conflicts with oxfmt
    'comma-dangle': 'off',
    curly: 'off',
    indent: 'off',
    semi: 'off',
    'space-before-function-paren': 'off',
    '@typescript-eslint/comma-dangle': 'off',

    'linebreak-style': ['error', 'unix'],
    '@typescript-eslint/semi': ['error', 'always'],
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        named: 'never',
      },
    ],
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
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: false,
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false },
      },
    ],

    // Rules added by the newer shared preset that are outside LiveTL's
    // existing lint contract.
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/block-spacing': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/object-curly-spacing': 'off',
    '@typescript-eslint/prefer-includes': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/unbound-method': 'off',
  },
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  globals: {
    Ytc: 'readonly',
    Chat: 'readonly',
    Ltl: 'readonly',
    YT: 'readonly',
    __BROWSER__: 'readonly',
    __MV__: 'readonly',
    __VERSION__: 'readonly',
  },
};
