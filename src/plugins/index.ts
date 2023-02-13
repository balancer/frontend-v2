import { App } from 'vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import store from '@/store';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import vueQuery from '@/plugins/vueQuery';

export function registerPlugins(app: App) {
  app.use(i18n).use(router).use(store).use(vueQuery).use(Web3Plugin);
  return app;
}
