const sveltePreprocess = require('svelte-preprocess');
const postcssPlugins = require('./postcss.config.js');

module.exports = {
  preprocess: sveltePreprocess({
    transformers: {
      postcss: {
        plugins: postcssPlugins()
      }
    }
  })
};
