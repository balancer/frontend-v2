const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const { version } = require('./package.json');

const release = `frontend-v2@${version}`;
const ENV = process.env.VUE_APP_SENTRY_AUTH_TOKEN || 'development';

const sentryWebpack = new SentryWebpackPlugin({
  // sentry-cli configuration
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'balancer-labs',
  project: 'app',
  release: release,
  // webpack specific configuration
  include: './dist',
  ignore: ['node_modules', 'webpack.config.js']
});

const plugins = ['production', 'staging'].includes(ENV) ? [sentryWebpack] : [];

module.exports = {
  publicPath: './',
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  configureWebpack: {
    plugins,
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization'
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set(
      'bn.js',
      path.resolve(path.join(__dirname, 'node_modules', 'bn.js'))
    );
  }
};
