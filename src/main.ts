import { createApp } from 'vue';
import store from '@/store';
import router from '@/plugins/router';
import mixins from '@/plugins/mixins';
import i18n from '@/plugins/i18n';
import blocknative from '@/plugins/blocknative';
import vueQuery from '@/plugins/vueQuery';
import initSentry from '@/plugins/sentry';
import registerDirectives from '@/plugins/directives';
import { registerGlobalComponents } from '@/plugins/components';
import Web3Plugin from '@/services/web3/web3.plugin';
import { use } from 'echarts/core';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent,
  PolarComponent
} from 'echarts/components';
import VueVirtualScroller from 'vue3-virtual-scroller';
import { CanvasRenderer } from 'echarts/renderers';
import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';
import { Web3Provider } from '@ethersproject/providers';
import Root from './Root';

use([
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent,
  PieChart,
  PolarComponent,
  BarChart
]);

const app = createApp(Root)
  .use(i18n)
  .use(router)
  .use(store)
  .use(blocknative)
  .use(vueQuery)
  .use(Web3Plugin, Web3Provider)
  .mixin(mixins)
  .use(VueVirtualScroller);

registerDirectives(app);
registerGlobalComponents(app);
initSentry(app);

app.mount('#app');

export default app;
