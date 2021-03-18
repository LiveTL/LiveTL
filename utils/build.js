const mode = process.argv.indexOf('production') != -1 ? 'production' : 'development';
process.env.NODE_ENV = process.env.NODE_ENV || mode;

var webpack = require('webpack'),
  config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

webpack(
  config,
  function (err) { if (err) throw err; }
);