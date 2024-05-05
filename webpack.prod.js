const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env) => {
  return merge(common(env), {
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin(),
      ],
    },
  })
};
