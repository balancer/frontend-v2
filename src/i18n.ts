import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const locale = 'en-US';

export default new VueI18n({
  locale,
  messages: {
    en: {
      messages: {
        EMPTY_STATE: 'No results found'
      }
    }
  },
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
