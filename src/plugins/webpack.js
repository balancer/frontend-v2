const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const { version } = require('../../package.json');

const plugins = [];

if (import.meta.env.VITE_SENTRY_AUTH_TOKEN) {
  const release = `frontend-v2@${version}`;
  const ENV = import.meta.env.VITE_ENV || 'development';

  const sentryWebpack = new SentryWebpackPlugin({
    // sentry-cli configuration
    authToken: import.meta.env.VITE_SENTRY_AUTH_TOKEN,
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
