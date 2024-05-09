const webpack = require('webpack')
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = (env) => {

  console.log(env)
  return {
    node: {
      global: false
    },
    entry: {
      background_scripts: './src/background.js',
      content_script: './src/content.js',
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
        global: 'window' // Placeholder for global used in any node_modules
      }),
      new webpack.DefinePlugin({
        __BUILD_CONTEXT__: JSON.stringify(env.target)
      }),
      // see https://vuejs.org/api/compile-time-flags.html
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      }),
      // make sure to include the plugin for the magic
      new VueLoaderPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: env.target === 'chrome' ? 'manifest-chrome.json' : 'manifest-firefox.json', to: 'manifest.json' },
          { from: __dirname + '/src/icons', to: 'icons' },
          { from: __dirname + '/src/' + 'popup/popup.html', to: 'popup/popup.html' },
          {
            from: env.target === 'chrome' ? __dirname + '/src/' + 'onboarding/onboarding-install-chrome.html' : __dirname + '/src/' + 'onboarding/onboarding-install-ff.html',
            to: 'onboarding/onboarding-install.html'
          },
          {
            from: env.target === 'chrome' ? __dirname + '/src/' + 'onboarding/onboarding-update-chrome.html' : __dirname + '/src/' + 'onboarding/onboarding-update-ff.html',
            to: 'onboarding/onboarding-update.html'
          },
          { from: __dirname + '/src/' + 'onboarding/ext-icon.png', to: 'onboarding/ext-icon.png' },
        ]
      })
    ]

  };
};
