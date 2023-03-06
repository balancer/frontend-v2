import { App } from 'vue';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import blocknative from '@/plugins/blocknative';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin } from '@tanstack/vue-query';

export function registerPlugins(app: App) {
  app
    .use(i18n)
    .use(router)
    .use(VueQueryPlugin)
    .use(blocknative)
    .use(VueVirtualScroller);
  return app;
}
