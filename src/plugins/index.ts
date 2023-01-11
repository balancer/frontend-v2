import { App } from 'vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import store from '@/store';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import blocknative from '@/plugins/blocknative';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin } from '@tanstack/vue-query';

export function registerPlugins(app: App) {
  app
    .use(i18n)
    .use(router)
    .use(store)
    .use(VueQueryPlugin)
    .use(blocknative)
    .use(Web3Plugin)
    .use(VueVirtualScroller);
  return app;
}

export function registerTestPlugins(app: App) {
  app
    .use(blocknative)
    .use(Web3Plugin)
    .use(VueQueryPlugin)
    .use(VueVirtualScroller);
  return app;
}
