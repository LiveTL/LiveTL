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
    sourceType: 'module'
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
        ]
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
