const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallback for 'process'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve('process/browser'),
  };

  // Add plugin to provide process
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  );

  return config;
} 