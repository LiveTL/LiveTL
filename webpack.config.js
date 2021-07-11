/* eslint-disable */
var webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs'),
  env = require('./utils/env'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  StringPlugin = require('string-replace-loader'),
  { version, description } = require('./package.json');
const BannerPlugin = webpack.BannerPlugin;
const { VueLoaderPlugin } = require('vue-loader');
const { preprocess } = require('./svelte.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');
const isAndroid = process.argv.includes('android');
const mode = isAndroid ? 'production' : (env.NODE_ENV || 'development');
const manifest = JSON.stringify({
  description: description,
  version: version,
  ...JSON.parse(JSON.stringify(require("./src/manifest.json")))
});
env.NODE_ENV = mode;

// load the secrets
var alias = {
  'jquery.ui': 'jquery-ui-bundle'
};

var secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'));

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}
const prod = mode !== 'development';
var options = {
  entry: {
    popout: path.join(__dirname, 'src', 'js', 'pages', 'popout.js'),
    options: path.join(__dirname, 'src', 'js', 'pages', 'options.js'),
    background: path.join(__dirname, 'src', 'js', 'pages', 'background.js'),
    watch: path.join(__dirname, 'src', 'js', 'pages', 'watch.js'),
    welcome: path.join(__dirname, 'src', 'js', 'pages', 'welcome.js'),
    hyperchat: path.join(__dirname, 'src', 'js', 'pages', 'hyperchat.js'),
    translatormode: path.join(__dirname, 'src', 'js', 'pages', 'translatormode.js'),
    injector: path.join(__dirname, 'src', 'js', 'content_scripts', 'injector.js'),
    fullscreen: path.join(__dirname, 'src', 'js', 'content_scripts', 'fullscreen.js'),
    chat: path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat.js'),
    'chat-interceptor': path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat-interceptor.js'),
    'chat-background': path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat-background.js'),
    // chrome: path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /src\/submodules\/chat\/scripts\/chat(-background)?\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: "const isLiveTL = false;",
          replace: 'const isLiveTL = true;',
        }
      }, {
        test: /.*/,
        use: [{
          loader: 'string-replace-loader',
          options: {
            search: "const isAndroid = false;",
            replace: `const isAndroid = ${isAndroid};`,
          }
        }],
        enforce: 'post'
      },
      {
        include: [
          path.resolve(__dirname, "node_modules/jquery-ui-touch-punch")
        ],
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: "(jQuery)",
          replace: '(window.jQuery)',
        }
      },
      // {
      //   test: /.*/,
      //   loader: 'cache-loader',
      //   include: /.*/
      // },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        // include: /.*/
        // exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          esModule: false // Don't treat images as modules
        },
        // include: /.*/
        // exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
        enforce: 'post' // Fix vue-loader issues
      },
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: !prod // Built-in HMR
            },
            emitCss: false,
            hotReload: !prod,
            preprocess
          }
        }
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            // Requires sass-loader@^7.0.0
            options: {
              implementation: require('sass'),
              indentedSyntax: true // optional
            },
            // Requires >= sass-loader@^8.0.0
            options: {
              implementation: require('sass'),
              sassOptions: {
                indentedSyntax: true // optional
              },
            },
          },
        ],
      }
    ]
  },
  resolve: {
    alias: alias
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new BannerPlugin({
      banner: fileSystem.readFileSync(
        path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
      ).toString().replace(
        'const MANIFEST_OBJECT = undefined;',
        `const MANIFEST_OBJECT = ${manifest};`
      ),
      raw: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/submodules/chat/assets',
          to: 'hyperchat'
        },
        {
          from: 'src/manifest.json',
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(manifest);
          }
        },
        {
          from: 'src/changelogs/img',
          to: 'img'
        },
        {
          from: 'src/img/blfavicon.ico',
          to: 'img'
        }
      ]
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          delete: ['./build/hyperchat/hyperchat.bundle.js'],
          move: [
            { 
              source: './build/hyperchat.bundle.js',
              destination: './build/hyperchat/hyperchat.bundle.js'
            },
          ],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'watch.html',
      chunks: ['watch'],
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'popout.html',
      chunks: ['popout'],
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'options.html',
      chunks: ['options'],
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'welcome.html',
      chunks: ['welcome'],
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'background.html',
      chunks: ['background', 'chat-background'],
      chunksSortMode: 'manual'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'empty.html'),
      filename: 'hyperchat/index.html',
      chunks: ['hyperchat'],
      chunksSortMode: 'manual'
    }),
  ],
  mode,
  devServer: {
    host: "http://localhost:3000/",
    disableHostCheck: true
  }
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'eval-cheap-module-source-map';
}

module.exports = options;
