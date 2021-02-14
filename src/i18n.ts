import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from '@/locales';

Vue.use(VueI18n);

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

export let defaultLocale = 'en-US';
const browserLocale = getBrowserLocale();
Object.keys(messages).forEach(locale => {
  if (locale.slice(0, 2) === browserLocale.slice(0, 2)) defaultLocale = locale;
});

export default new VueI18n({
  locale: defaultLocale,
  messages,
  dateTimeFormats: {
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  }
});
