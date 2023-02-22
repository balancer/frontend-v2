import { PageContext } from './types';
import { createSSRApp, createApp, h } from 'vue';
import LayoutComponent from '@/components/ssr/Layout.vue';
import i18n from '@/plugins/i18n';
import { VueQueryPlugin } from '@tanstack/vue-query';
// import Jazzicon from 'vue3-jazzicon/src/components';

export function createPageApp(pageContext: PageContext, isSPA: boolean) {
  const { Page: PageComponent, pageProps } = pageContext;

  const createAppFunc = isSPA ? createApp : createSSRApp;

  const AppComponent = {
    render() {
      const renderLayoutSlot = () => h(PageComponent, pageProps || {});
      return h(LayoutComponent, pageProps || {}, { default: renderLayoutSlot });
    },
  };

  const app = createAppFunc(AppComponent);
  app.use(VueQueryPlugin);
  app.use(i18n);
  app.provide('pageContext', pageContext);
  // app.component('Jazzicon', Jazzicon);

  return app;
}
