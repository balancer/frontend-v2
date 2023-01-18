import translations from '@/locales/default.json';
import { createI18n } from 'vue-i18n';

export const i18nMock = createI18n({
  locale: 'en-US',
  legacy: false,
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
