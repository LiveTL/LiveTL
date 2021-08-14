const sveltePreprocess = require('svelte-preprocess');
const postcssPlugins = require('./postcss.config.js');

module.exports = {
  preprocess: sveltePreprocess({
    scss: { // Remove when fully migrated to smelte
      includePaths: ['theme']
    },
    transformers: {
      postcss: {
        plugins: postcssPlugins()
      }
    }
  })
};
