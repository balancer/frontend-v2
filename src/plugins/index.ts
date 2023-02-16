import { App } from 'vue';
import store from '@/store';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import blocknative from '@/plugins/blocknative';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { provideWeb3Plugin } from '@/providers/web3-plugin.provider';

export function registerPlugins(app: App) {
  //TODO: is this testable?? is this SSR?
  provideWeb3Plugin(app);
  app
    .use(i18n)
    .use(router)
    .use(store)
    .use(VueQueryPlugin)
    .use(blocknative)
    .use(VueVirtualScroller);
  return app;
}
