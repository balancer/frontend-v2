import { App } from 'vue';
import { i18nMock } from './i18n-mock';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin, VueQueryPluginOptions } from '@tanstack/vue-query';

const options: VueQueryPluginOptions = {
  queryClientConfig: {
    // Disables retries in tests mode to reduce noise when a test fails because of a broken query
    defaultOptions: { queries: { retry: false } },
  },
};
export function registerTestPlugins(app: App) {
  app.use(i18nMock).use(VueQueryPlugin, options).use(VueVirtualScroller);
  return app;
}
