import { App } from 'vue';
import { captureException, init, setTag } from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

// Using Sentry's vanila JS package (@sentry/browser) here instead of
// the official vue package (@sentry/vue) because it doesn't support vue 3 yet.
// https://github.com/getsentry/sentry-javascript/issues/2925

const ENV = process.env.NODE_ENV || 'development';
const NETWORK = process.env.VUE_APP_NETWORK || '42';
const networkMap = {
  '1': 'mainnet',
  '42': 'kovan'
};
const environment = `${ENV}-${networkMap[NETWORK]}`;

export default function initSentry(app: App) {
  if (ENV === 'production') {
    app.config.errorHandler = (error, _, info) => {
      try {
        setTag('info', info);
        captureException(error);
      } catch (error) {
        console.error('Failed to send error to Sentry', error);
      }
    };

    init({
      dsn:
        'https://d292b6ec7b6e4aa2801d972e06cb232c@o574636.ingest.sentry.io/5725878',
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      environment
    });
  }
}
