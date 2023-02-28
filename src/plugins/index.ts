// import Web3Plugin from '@/services/web3/web3.plugin';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import store from '@/store';
import { App } from 'vue';

import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin } from '@tanstack/vue-query';
// import Web3Plugin from '@/services/web3/web3.plugin';

export function registerPlugins(app: App) {
  app
    .use(i18n)
    .use(router)
    .use(store)
    .use(VueQueryPlugin) //Adds 28KB
    // .use(blocknative)
    // .use(Web3Plugin) // Adds 1MB
    .use(VueVirtualScroller);
  return app;
}
