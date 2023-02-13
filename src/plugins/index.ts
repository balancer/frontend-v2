import { App } from 'vue';
import store from '@/store';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import vueQuery from '@/plugins/vueQuery';

export function registerPlugins(app: App) {
  app.use(i18n).use(router).use(store).use(vueQuery);
  return app;
}
