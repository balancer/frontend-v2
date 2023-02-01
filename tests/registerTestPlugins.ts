import { App } from 'vue';
import { i18nMock } from './i18n-mock';
import VueVirtualScroller from 'vue3-virtual-scroller';
import vueQuery from '@/plugins/vueQuery';
import Web3Plugin from '@/services/web3/web3.plugin';

export function registerTestPlugins(app: App) {
  app.use(i18nMock).use(Web3Plugin).use(vueQuery).use(VueVirtualScroller);
  return app;
}
