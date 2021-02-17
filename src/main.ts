import { createApp } from 'vue';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import options from '@/auth';
import VueClipboard from 'vue3-clipboard';
import Jazzicon from 'vue3-jazzicon/src/components';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import i18n from '@/i18n';
import '@/auth';
import '@/style.scss';

// import infiniteScroll from 'vue-infinite-scroll';
// import VueApexCharts from 'vue-apexcharts';
import dockerParity from '@/utils/balancer/configs/docker-parity.json';
import { MULTICALL } from '@snapshot-labs/snapshot.js/src/utils';

MULTICALL['17'] = dockerParity.multicall;

// Vue.use(VueApexCharts);
// Vue.component('apexchart', VueApexCharts);

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store)
  .use(VueClipboard, {
    autoSetContainer: true
  })
  .use(LockPlugin, options)
  .component('jazzicon', Jazzicon)
  .mixin(mixins);

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  app.component(componentName, componentConfig.default || componentConfig);
});

app.mount('#app');

export default app;
