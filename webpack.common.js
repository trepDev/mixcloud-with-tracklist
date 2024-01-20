const webpack = require('webpack')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  node: {
    global: false
  },
  entry: {
    background_scripts: './src/background.js',
    content_script: './src/content.js',
    settings: './src/settings/settings.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'addon'),
    filename: '[name]/index.js'
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window'		// Placeholder for global used in any node_modules
    }),
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: __dirname + '/src/icons', to: 'icons' },
        { from: __dirname + '/src/' + 'settings/settings.html', to: 'settings/settings.html' },
        { from: __dirname + '/src/' + 'popup/popup.html', to: 'popup/popup.html' },
        { from: __dirname + '/src/' + 'onboarding/onboarding.html', to: 'onboarding/onboarding.html' },
        { from: __dirname + '/src/' + 'onboarding/onboarding.css', to: 'onboarding/onboarding.css' }
      ]
    })
  ]

}
