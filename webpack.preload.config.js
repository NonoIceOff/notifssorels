const rules = require('./webpack.rules');

module.exports = {
  entry: './src/preload.js',
  module: {
    rules
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
};
