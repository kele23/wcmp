const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const src = path.resolve(__dirname);
const dist = path.resolve(__dirname, './dist');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',

  entry: path.resolve(src, 'index.js'),
  output: {
    path: dist,
    filename: 'bundle.js',
  },

  devServer: {
    static: dist,
    webSocketServer: 'sockjs',
    host: '0.0.0.0',
    allowedHosts: 'all',
    hot: false,
    port: 3000,
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'WEB Components Test',
      template: path.resolve(src, 'index.html'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules[\\/]core-js/, /node_modules[\\/]webpack[\\/]buildin/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
              plugins: [['@babel/plugin-proposal-decorators', { version: '2022-03' }]],
            },
          },
        ],
      },
    ],
  },
};
