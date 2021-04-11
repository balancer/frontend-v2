import { createApp } from 'vue';
import App from '@/App.vue';
import store from '@/store';
import router from '@/plugins/router';
import mixins from '@/plugins/mixins';
import i18n from '@/plugins/i18n';
import blocknative from '@/plugins/blocknative';
import authOptions from '@/plugins/authOptions';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import VueApexCharts from 'vue3-apexcharts';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store)
  .use(blocknative)
  .use(LockPlugin, authOptions)
  .use(VueApexCharts)
  .mixin(mixins);

const requireComponent = require.context(
  '@/components',
  true,
  /^((?![\\/]cards|[\\/]dialogs|[\\/]forms|[\\/]modals|[\\/]images|[\\/]navs).)*\.vue$/
);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  app.component(componentName, componentConfig.default || componentConfig);
});

app.mount('#app');

export default app;
