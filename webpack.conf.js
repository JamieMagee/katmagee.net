import webpack from 'webpack';
import path from 'path';

export default {
  module: {
    rules: [
      {
        test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[hash].[ext]',
        },
      },
      {
        loader: 'babel-loader',
        test: /\.js?$/,
        exclude: /node_modules/,
        options: { cacheDirectory: true },
      },
    ],
  },

  context: path.join(__dirname, 'src'),
  entry: {
    cms: ['./js/cms'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  externals: [/^vendor\/.+\.js$/],
};
