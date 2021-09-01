module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true
  },
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte']
  },
  plugins: [
    'svelte3',
    '@typescript-eslint'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'no-multiple-empty-lines': [
          'error',
          { max: 2 }
        ],
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        // Causes false positives with reactive and auto subscriptions
        '@typescript-eslint/strict-boolean-expressions': 'off'
      }
    }
  ],
  rules: {
    'linebreak-style': [
      'error',
      'unix'
    ],
    semi: 'off',
    '@typescript-eslint/semi': [
      'error',
      'always'
    ],
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }
    ],
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        named: 'never'
      }
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
        allowAny: true
      }
    ],
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: false
      }
    ]
  },
  settings: {
    'svelte3/typescript': () => require('typescript')
  },
  globals: {
    Ytc: 'readonly',
    Chat: 'readonly',
    Ltl: 'readonly'
  }
};
