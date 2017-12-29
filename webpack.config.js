const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    popup: './src/popup.js',
    //setup: './src/setup.js',
    background: './src/background.js',
    //update: './src/update.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './src'),
          /pretty-bytes/ // <- ES6 module
        ],
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        use: 'file-loader?limit=100000'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?limit=100000',
          {
            loader: 'img-loader',
            options: {
              enabled: true,
              optipng: true
            }
          }
        ]
      }
    ]
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    modules: false
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['popup'],
      filename: 'popup.html',
      template: './src/popup.html'
    }),
    /*new HtmlWebpackPlugin({
      inject: true,
      chunks: ['setup'],
      filename: 'setup.html',
      template: './src/setup.html'
    }),*/
    // copy extension manifest and icons
    new CopyWebpackPlugin([
      { from: './src/manifest.json' },
      { from: './src/script_injection.js' },
      { context: './src/assets', from: 'icon-**', to: 'assets' },
      { context: './src/options_custom', from: '*', to: 'options_custom' },
      { context: './src/options_custom', from: '*/*', to: 'options_custom' },
      { context: './src/options_custom', from: '*/**/*', to: 'options_custom' },
      { context: './src/_locales', from: '*/**/*', to: '_locales' }
    ])
  ]
}
