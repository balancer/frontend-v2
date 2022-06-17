import '@testing-library/jest-dom';

import { config } from '@vue/test-utils';
import nock from 'nock';
import { createI18n } from 'vue-i18n';

import translations from '@/locales/default.json';

const i18n = createI18n({
  legacy: true,
  locale: 'en-US',
  messages: { 'en-US': translations },
  dateTimeFormats: {
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
});

/**
 * HTTP Requests
 *
 * We should not allow external http requests from tests
 * All http requests should be mocked with expected responses
 * See nock docs for details: https://github.com/nock/nock
 */
nock.disableNetConnect();
// Enable for mocked websockets
nock.enableNetConnect('balancer.fi');

config.global.plugins = [i18n];
