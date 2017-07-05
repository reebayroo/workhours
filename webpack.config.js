var path = require('path'),
  webpack = require('webpack');

var config = {
  ROOT_DIR: path.resolve(__dirname, 'public'),
  SCRIPT_DIR: path.resolve(__dirname, 'public/javascripts'),
  STYLE_DIR: path.resolve(__dirname, 'public/styles'),
  BUILD_DIR: path.resolve(__dirname, 'public/build')
};

module.exports = {
  entry: path.resolve(config.SCRIPT_DIR, 'client.js'),
  output: {
    path: config.BUILD_DIR,
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'WorkHours'
  },
  module: {
    loaders: [{
      test: require.resolve('jquery'),
      loader: 'expose-loader?$!expose-loader?jQuery'
    }, {
      test: /.js?$/,
      loader: 'babel-loader',
      include: [
        config.SCRIPT_DIR,
      ],
      exclude: /node_modules|semantic\/dist/,
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass']
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg|jpg)$/,
      loader: 'url-loader?limit=100000'
    }, ]
  },
  // externals: {
  //   'jquery': 'jQuery'
  // },
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     $: 'jquery',
  //     jQuery: 'jquery'
  //   })
  // ]
};