// Setup test suite for jsdom.
vi.unmock('vue-i18n');
import '@testing-library/jest-dom';

import { config, RouterLinkStub } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import translations from '@/locales/default.json';

const i18n = createI18n({
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

// Testing Library config
config.global.plugins = [i18n];
config.global.stubs = {
  RouterLink: RouterLinkStub,
  Jazzicon: true,
  BalIcon: true,
};
