import { createApp } from 'vue';
import App from '@/App.vue';
import store from '@/store';
import router from '@/plugins/router';
import mixins from '@/plugins/mixins';
import i18n from '@/plugins/i18n';
import blocknative from '@/plugins/blocknative';
import initSentry from '@/plugins/sentry';
import authOptions from '@/plugins/authOptions';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import VueApexCharts from 'vue3-apexcharts';
import { registerGlobalComponents } from '@/plugins/components';
import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';

const queryClient = new QueryClient();
queryClient.mount();

use([
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  ToolboxComponent
]);

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store)
  .use(blocknative)
  .use(LockPlugin, authOptions)
  .use(VueApexCharts)
  .provide(VUE_QUERY_CLIENT, queryClient)
  .mixin(mixins);

registerGlobalComponents(app);
initSentry(app);

app.mount('#app');

export default app;
