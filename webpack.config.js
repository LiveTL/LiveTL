const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs');
const env = require('./utils/env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version, description } = require('./package.json');
const { preprocess } = require('./svelte.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPlugins = require('./postcss.config.js');

const manifest = JSON.stringify({
  description: description,
  version: version,
  ...JSON.parse(JSON.stringify(require('./src/manifest.json')))
});

// load the secrets
const alias = {
  'jquery.ui': 'jquery-ui-bundle',
  svelte: path.resolve('node_modules', 'svelte')
};

const secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'));

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const transformManifest = (manifestString, version, isChrome = false) => {
  const newManifest = {
    ...JSON.parse(manifestString),
    description,
    version
  };
  if (isChrome) newManifest.incognito = 'split';
  return JSON.stringify(newManifest);
};

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath;
}

module.exports = (env, options) => {
  const isAndroid = env.android;
  const mode = isAndroid ? 'production' : (options.mode || 'development');
  const prod = mode !== 'development';

  const envVersion = env.version;
  const hasEnvVersion = (envVersion != null && typeof envVersion === 'string');
  if (hasEnvVersion) manifest.version = envVersion;

  const polyfill = isAndroid ? ['polyfill'] : [];

  const config = {
    entry: {
      popout: path.join(__dirname, 'src', 'js', 'pages', 'popout.js'),
      options: path.join(__dirname, 'src', 'js', 'pages', 'options.js'),
      background: path.join(__dirname, 'src', 'js', 'pages', 'background.js'),
      watch: path.join(__dirname, 'src', 'js', 'pages', 'watch.js'),
      welcome: path.join(__dirname, 'src', 'js', 'pages', 'welcome.js'),
      lite: path.join(__dirname, 'src', 'js', 'pages', 'lite.js'),
      translatormode: path.join(__dirname, 'src', 'js', 'pages', 'translatormode.js'),
      injector: path.join(__dirname, 'src', 'js', 'content_scripts', 'injector.js'),
      'chat-interceptor': path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-interceptor.ts'),
      'chat-background': path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-background.ts'),
      chat: path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-injector.ts'),
      'hyperchat/hyperchat': path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'hyperchat.ts'),
      'yt-workaround': path.join(__dirname, 'src', 'ts', 'yt-workaround.ts'),
      'workaround-injector': path.join(__dirname, 'src', 'ts', 'content_scripts', 'workaround-injector.ts'),
      polyfill: path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].bundle.js',
      publicPath: '/'
    },
    resolve: {
      alias: alias,
      extensions: ['.mjs', '.js', '.svelte', '.tsx', '.ts'],
      mainFields: ['svelte', 'browser', 'module', 'main']
    },
    module: {
      rules: [
        {
          test: /src\/submodules\/chat\/src\/ts\/chat-constants\.ts$/,
          loader: 'string-replace-loader',
          options: {
            multiple: [
              {
                search: 'export const isLiveTL = false;',
                replace: 'export const isLiveTL = true;'
              },
              {
                search: 'export const isAndroid = false;',
                replace: `export const isAndroid = ${isAndroid};`
              }
            ]
          }
        },
        {
          test: /src\/js\/constants\.js$/,
          use: [{
            loader: 'string-replace-loader',
            options: {
              search: 'const isAndroid = false;',
              replace: `const isAndroid = ${isAndroid};`
            }
          }],
          enforce: 'post'
        },
        {
          include: [
            path.resolve(__dirname, 'node_modules/jquery-ui-touch-punch')
          ],
          test: /\.js$/,
          loader: 'string-replace-loader',
          options: {
            search: '(jQuery)',
            replace: '(window.jQuery)'
          }
        },
        // {
        //   test: /.*/,
        //   loader: 'cache-loader',
        //   include: /.*/
        // },
        // {
        //   test: /\.css$/,
        //   use: ['style-loader', 'css-loader']
        //   // include: /.*/
        //   // exclude: /node_modules/
        // },
        {
          test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            esModule: false // Don't treat images as modules
          }
          // include: /.*/
          // exclude: /node_modules/
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
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  extract: true,
                  plugins: postcssPlugins(prod)
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // clean the build folder
      new CleanWebpackPlugin(),
      // // expose and write the allowed env vars on the compiled bundle
      // new webpack.DefinePlugin({
      //   'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
      // }),
      // ...(isAndroid
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/submodules/chat/assets',
            to: 'hyperchat'
          },
          {
            from: 'src/manifest.json',
            transform: (content) => {
              return transformManifest(content, hasEnvVersion ? envVersion : version);
            }
          },
          {
            from: 'src/manifest.json',
            to: 'manifest.chrome.json',
            transform: (content) => {
              return transformManifest(content, hasEnvVersion ? envVersion : version, true);
            }
          },
          {
            from: 'src/img',
            to: 'img'
          }
        ]
      }),
      // new FileManagerPlugin({
      //   events: {
      //     onEnd: {
      //       delete: [
      //         './build/hyperchat/hyperchat.bundle.js'
      //         // './build/hyperchat/hyperchat.css'
      //       ],
      //       move: [
      //         {
      //           source: './build/hyperchat.bundle.js',
      //           destination: './build/hyperchat/hyperchat.bundle.js'
      //         },
      //         {
      //           source: './build/hyperchat.css',
      //           destination: './build/hyperchat/hyperchat.css'
      //         }
      //       ]
      //     }
      //   }
      // }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'watch.html',
        chunks: [...polyfill, 'watch'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'popout.html',
        chunks: [...polyfill, 'popout'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'options.html',
        chunks: [...polyfill, 'options'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'welcome.html',
        chunks: [...polyfill, 'welcome'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'lite.html',
        chunks: [...polyfill, 'lite'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'background.html',
        chunks: [...polyfill, 'background', 'chat-background'],
        chunksSortMode: 'manual'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'hyperchat/index.html',
        chunks: [...polyfill, 'hyperchat/hyperchat'],
        chunksSortMode: 'manual'
      }),
      new MiniCssExtractPlugin({ filename: '[name].css' })
    ],
    mode: mode || 'development'
  };

  if (isAndroid) {
    console.log('isAndroid');
  }

  if (prod) {
    config.devtool = false;
  } else {
    config.devtool = 'eval-cheap-module-source-map';
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.devServer = {
      host: 'localhost',
      port: 3000,
      disableHostCheck: true,
      hot: true,
      contentBase: path.join(__dirname, '../build'),
      headers: { 'Access-Control-Allow-Origin': '*' },
      writeToDisk: true // write-file-webpack-plugin no longer needed
    };
  }

  return config;
};
