const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const { version } = require('./package.json');

const plugins = [];

if (process.env.VUE_APP_SENTRY_AUTH_TOKEN) {
  const release = `frontend-v2@${version}`;
  const ENV = process.env.VUE_APP_ENV || 'development';

  const sentryWebpack = new SentryWebpackPlugin({
    // sentry-cli configuration
    authToken: process.env.VUE_APP_SENTRY_AUTH_TOKEN,
    org: 'balancer-labs',
    project: 'app',
    release: release,
    // webpack specific configuration
    include: './dist',
    ignore: ['node_modules', 'webpack.config.js']
  });

  if (['production', 'staging'].includes(ENV)) {
    plugins.push(sentryWebpack);
  }
}

module.exports = {
  parallel: false, // Fixes <script setup> components not compiling: https://github.com/vuejs/vue-cli/issues/6282
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
