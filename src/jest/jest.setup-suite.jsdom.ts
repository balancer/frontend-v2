// Setup test suite for jsdom.
jest.unmock('vue-i18n');
import '@testing-library/jest-dom';

import { config, RouterLinkStub } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalChip from '@/components/_global/BalChip/BalChip.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import BalTable from '@/components/_global/BalTable/BalTable.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import CompositionIcon from '@/components/_global/icons/CompositionIcon.vue';
import NetworkIcon from '@/components/_global/icons/NetworkIcon.vue';
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
  Jazzicon: { template: '<span />' },
};

config.global.components = {
  BalBtn,
  BalTooltip,
  BalChip,
  BalLoadingBlock,
  NetworkIcon,
  BalTable,
  CompositionIcon,
  BalCard,
};
