import Vue from 'vue';
import PortalVue from 'portal-vue';
import autofocus from 'vue-autofocus-directive';
import infiniteScroll from 'vue-infinite-scroll';
import TextareaAutosize from 'vue-textarea-autosize';
import VueClipboard from 'vue-clipboard2';
import Jazzicon from 'vue-jazzicon';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import VueApexCharts from 'vue-apexcharts';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import '@/auth';
import '@/style.scss';

Vue.use(infiniteScroll);
Vue.use(VueClipboard);
Vue.use(TextareaAutosize);
Vue.use(PortalVue);
Vue.use(VueApexCharts);

import { MULTICALL } from '@snapshot-labs/snapshot.js/src/utils';
MULTICALL['17'] = '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc';

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.component('apexchart', VueApexCharts);
Vue.component('jazzicon', Jazzicon);
Vue.mixin(mixins);
Vue.directive('autofocus', autofocus);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
