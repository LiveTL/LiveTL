// Should be same as https://github.com/LiveTL/HyperChat/blob/mv3/postcss.config.js

const extractor = require('smelte/src/utils/css-extractor.js');
const tailwindConfig = require('./tailwind.config.js');

const safelistSelectors = [
  'html',
  'body',
  'stroke-primary',
  'mode-dark',
  // Components with custom color prop might need its color to be whitelisted too
  'bg-blue-500',
  'hover:bg-blue-400',
  // is not in HyperChat's postcss conf but was in LiveTL's
  'text-alert-500'
];

const safelistPatterns = [
  // for JS ripple
  /ripple/,
  // date picker
  /w-.\/7/,
  // I'm guessing it doesn't correlate p-2.5 with p-2\.5
  /^[mphw]\w?-\d\.5$/
];

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-url': {},
    'postcss-input-range': {},
    tailwindcss: tailwindConfig,
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: ['./**/*.svelte'],
      extractors: [
        {
          extractor,
          extensions: ['svelte']
        }
      ],
      safelist: {
        standard: safelistSelectors,
        deep: safelistPatterns
      }
    }
  }
};
