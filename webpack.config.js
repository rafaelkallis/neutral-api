/**
 * references:
 *   https://docs.nestjs.com/recipes/hot-reload#configuration-1
 *   https://github.com/nestjs/nest-cli/blob/999eb019b8caf66f12bf02656d62d5e2c6fda9e6/lib/compiler/defaults/webpack-defaults.ts
 */

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const commonConfig = {
  target: 'node',
  mode: 'none',
  devtool: 'inline-source-map',
  entry: [
    path.resolve(__dirname, 'src', 'main.ts'),
  ],
  output: { 
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin(),
    ],
  },
  node: {
    __filename: false,
    __dirname: false,
  },
};

const prodConfig = merge(commonConfig, {
  name: 'prod',
  externals: nodeExternals(),
  optimization: {
    nodeEnv: 'production',
    noEmitOnErrors: true,
  },
});

const devConfig = merge(commonConfig, {
  name: 'dev',
  watch: true,
  entry: [
    'webpack/hot/poll?100',
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new StartServerPlugin({
      name: 'main.js',
      nodeArgs: ['--inspect'],
    }),
  ],
  externals: nodeExternals({ whitelist: ['webpack/hot/poll?100'] }),
  optimization: {
    nodeEnv: 'development',
    namedModules: true,
    namedChunks: true,
  },
});

module.exports = [prodConfig, devConfig];