// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    contentScript: './src/contentScript.ts',
    background: './src/background.ts',
    popup: './src/popup.ts',
    // Add other entry points if needed
  },
  output: {
    path: path.resolve(__dirname, 'dist/src/'),
    filename: '[name].js', // [name] will be replaced with the entry point names
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { ascii_only: true },
        },
      }),
    ],
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        return chunk.name !== 'background';
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
};
