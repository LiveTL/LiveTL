const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs');
const env = require('./utils/env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version, description } = require('./package.json');
const BannerPlugin = webpack.BannerPlugin;
// const { VueLoaderPlugin } = require('vue-loader');
const { preprocess } = require('./svelte.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
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

const transformManifest = (manifestString, isChrome = false) => {
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

  const config = {
    entry: {
      popout: path.join(__dirname, 'src', 'js', 'pages', 'popout.js'),
      options: path.join(__dirname, 'src', 'js', 'pages', 'options.js'),
      background: path.join(__dirname, 'src', 'js', 'pages', 'background.js'),
      watch: path.join(__dirname, 'src', 'js', 'pages', 'watch.js'),
      welcome: path.join(__dirname, 'src', 'js', 'pages', 'welcome.js'),
      // hyperchat: path.join(__dirname, 'src', 'js', 'pages', 'hyperchat.js'),
      translatormode: path.join(__dirname, 'src', 'js', 'pages', 'translatormode.js'),
      injector: path.join(__dirname, 'src', 'js', 'content_scripts', 'injector.js'),
      // chat: path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat.js'),
      // 'chat-interceptor': path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat-interceptor.js'),
      // 'chat-background': path.join(__dirname, 'src', 'submodules', 'chat', 'scripts', 'chat-background.js'),
      // chrome: path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
      'chat-interceptor': path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-interceptor.ts'),
      'chat-background': path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-background.ts'),
      chat: path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'ts', 'chat-injector.ts'),
      hyperchat: path.join(__dirname, 'src', 'submodules', 'chat', 'src', 'hyperchat.ts')
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].bundle.js',
      publicPath: './'
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
        // {
        //   test: /.*/,
        //   use: [{
        //     loader: 'string-replace-loader',
        //     options: {
        //       search: 'const isAndroid = false;',
        //       replace: `const isAndroid = ${isAndroid};`
        //     }
        //   }],
        //   enforce: 'post'
        // },
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
        // {
        //   test: /\.html$/,
        //   loader: 'html-loader',
        //   exclude: /node_modules/,
        //   enforce: 'post' // Fix vue-loader issues
        // },
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
        // {
        //   test: /\.vue$/,
        //   loader: 'vue-loader'
        // },
        // {
        //   test: /\.s(c|a)ss$/,
        //   use: [
        //     'vue-style-loader',
        //     'css-loader',
        //     {
        //       loader: 'sass-loader',
        //       // Requires sass-loader@^7.0.0
        //       options: {
        //         implementation: require('sass'),
        //         indentedSyntax: true // optional
        //       },
        //       // Requires >= sass-loader@^8.0.0
        //       options: {
        //         implementation: require('sass'),
        //         sassOptions: {
        //           indentedSyntax: true // optional
        //         }
        //       }
        //     }
        //   ]
        // },
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
      //   ? [new BannerPlugin({
      //       banner: fileSystem.readFileSync(
      //         path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
      //       ).toString().replace(
      //         'const MANIFEST_OBJECT = undefined;',
      //         `const MANIFEST_OBJECT = ${manifest};`
      //       ),
      //       raw: true
      //     })]
      //   : []),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/submodules/chat/assets',
            to: 'hyperchat'
          },
          {
            from: 'src/manifest.json',
            transform: (content) => {
              return transformManifest(content);
            }
          },
          {
            from: 'src/manifest.json',
            to: 'manifest.chrome.json',
            transform: (content) => {
              return transformManifest(content, true);
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
            delete: [
              './build/hyperchat/hyperchat.bundle.js'
              // './build/hyperchat/hyperchat.css'
            ],
            move: [
              {
                source: './build/hyperchat.bundle.js',
                destination: './build/hyperchat/hyperchat.bundle.js'
              },
              {
                source: './build/hyperchat.css',
                destination: './build/hyperchat/hyperchat.css'
              }
            ]
          }
        }
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
      // new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'empty.html'),
        filename: 'hyperchat/index.html',
        chunks: ['hyperchat'],
        chunksSortMode: 'manual'
      }),
      new MiniCssExtractPlugin({ filename: '[name].css' })
    ],
    mode: mode || 'development'
  };

  if (isAndroid) {
    console.log('isAndroid');
    config.plugins.push(new BannerPlugin({
      banner: fileSystem.readFileSync(
        path.join(__dirname, 'src', 'js', 'polyfills', 'chrome.js')
      ).toString().replace(
        'const MANIFEST_OBJECT = undefined;',
        `const MANIFEST_OBJECT = ${manifest};`
      ),
      raw: true
    }));
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
