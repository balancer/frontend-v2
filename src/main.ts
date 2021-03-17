import { createApp } from 'vue';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import options from '@/auth';
import VueClipboard from 'vue3-clipboard';
import VueApexCharts from 'vue3-apexcharts';
import Jazzicon from 'vue3-jazzicon/src/components';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import i18n from '@/i18n';
import '@/auth';
import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';
// import infiniteScroll from 'vue-infinite-scroll';

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store)
  .use(VueClipboard, {
    autoSetContainer: true
  })
  .use(LockPlugin, options)
  .use(VueApexCharts)
  .component('jazzicon', Jazzicon)
  .directive('autofocus', {
    mounted(el) {
      el.focus();
    }
  })
  .mixin(mixins);

const requireComponent = require.context(
  '@/components',
  true,
  /^((?![\\/]cards|[\\/]dialogs|[\\/]forms).)*\.vue$/
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
