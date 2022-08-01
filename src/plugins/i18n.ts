import { createI18n } from 'vue-i18n';

import messages from '@/locales';

messages['en-US'] = messages.default;
delete messages.default;

export function getBrowserLocale() {
  if (typeof navigator !== 'undefined') {
    return (
      navigator['userLanguage'] ||
      navigator['language'] ||
      (navigator.languages?.[0] ? navigator.languages[0] : undefined)
    );
  }
  return undefined;
}

const defaultLocale = 'en-US';
// const browserLocale = getBrowserLocale();
// Object.keys(messages).forEach(locale => {
//   if (locale.slice(0, 2) === browserLocale.slice(0, 2)) defaultLocale = locale;
// });

const i18n = createI18n({
  locale: defaultLocale,
  messages,
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

export default i18n;
