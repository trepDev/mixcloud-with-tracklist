const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env) => {
  return merge(common(env), {
    mode: 'production',
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              pure_funcs: [ 'console.log' ]
            },
          },
        }),
      ],
    },
  })
};
