import { App } from 'vue';
import { i18nMock } from './i18n-mock';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { VueQueryPlugin } from '@tanstack/vue-query';

export function registerTestPlugins(app: App) {
  app.use(i18nMock).use(VueQueryPlugin).use(VueVirtualScroller);
  return app;
}
