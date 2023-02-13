import { App } from 'vue';
import router from '@/plugins/router';

export function registerPlugins(app: App) {
  app.use(router);
  return app;
}
