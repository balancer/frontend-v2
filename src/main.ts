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
import { registerGlobalComponents } from '@/plugins/components';
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

registerGlobalComponents(app);

app.mount('#app');

export default app;
