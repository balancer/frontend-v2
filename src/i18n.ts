import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from '@/locales';

Vue.use(VueI18n);

const locale = 'en-US';

export default new VueI18n({
  locale,
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
