import { App } from 'vue';
import store from '@/store';
import router from '@/plugins/router';

export function registerPlugins(app: App) {
  app.use(router).use(store);
  return app;
}
