module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    webextensions: true
  },
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  parserOptions: {
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
      files: ['*.js', 'utils/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      }
    },
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 'off',
        'no-multiple-empty-lines': [
          'error',
          { max: 2 }
        ],
        // Causes false positives with reactive and auto subscriptions
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        'no-sequences': 'off',
        'svelte/missing-declaration': 'off',
      }
    }
  ],
  rules: {
    // TODO: probably want to enable some of these
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',

    'linebreak-style': [
      'error',
      'unix'
    ],
    '@typescript-eslint/semi': [
      'error',
      'always'
    ],
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }
    ],
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
    ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false }
      }
    ],
  },
  settings: {
    'svelte3/typescript': () => require('typescript'),
    'svelte3/ignore-warnings': (warning) => {
      if (warning.code === 'a11y-click-events-have-key-events') {
        return true;
      }

      if (warning.code === 'missing-declaration' && warning.message === "'__VERSION__' is not defined") {
        return true;
      }

      return false;
    },
  },
};
