import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { createApp } from 'vue';

import { registerGlobalComponents } from '@/plugins/components';
import registerDirectives from '@/plugins/directives';
import { registerPlugins } from '@/plugins';
import initSentry from '@/plugins/sentry';

import App from './App.vue';

echarts.use([
  TooltipComponent,
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  BarChart,
  PieChart,
]);

const app = createApp(App);

registerPlugins(app);
registerDirectives(app);
registerGlobalComponents(app);
initSentry(app);

app.mount('#app');

export default app;
