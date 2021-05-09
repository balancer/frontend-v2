import { createApp } from 'vue';
import App from '@/App.vue';
import store from '@/store';
import router from '@/plugins/router';
import mixins from '@/plugins/mixins';
import i18n from '@/plugins/i18n';
import blocknative from '@/plugins/blocknative';
import vueQuery from '@/plugins/vueQuery';
import initSentry from '@/plugins/sentry';
import authOptions from '@/plugins/authOptions';
import registerDirectives from '@/plugins/directives';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import VueApexCharts from 'vue3-apexcharts';
import { registerGlobalComponents } from '@/plugins/components';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { CanvasRenderer } from 'echarts/renderers';
import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

use([
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent
]);

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store)
  .use(blocknative)
  .use(LockPlugin, authOptions)
  .use(VueApexCharts)
  .use(vueQuery)
  .use(VueVirtualScroller)
  .mixin(mixins);

registerDirectives(app);
registerGlobalComponents(app);
initSentry(app);

app.mount('#app');

export default app;
