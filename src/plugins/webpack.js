const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const { version } = require('../../package.json');

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
    ignore: ['node_modules', 'webpack.config.js'],
  });

  if (['production', 'staging'].includes(ENV)) {
    plugins.push(sentryWebpack);
  }
}

module.exports = plugins;
