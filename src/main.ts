import '@/assets/css/index.css';
import '@/assets/css/tailwind.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

// import * as echarts from 'echarts/core';
import { registerPlugins } from '@/plugins';
import registerDirectives from '@/plugins/directives';
import initSentry from '@/plugins/sentry';
import { createApp } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

import { initDependencies } from './dependencies';
import Root from './Root.vue';

initDependencies();

// echarts.use([
//   TooltipComponent,
//   CanvasRenderer,
//   LineChart,
//   GridComponent,
//   LegendComponent,
//   BarChart,
//   PieChart,
// ]);

const app = createApp(Root);

app.component('Jazzicon', Jazzicon);

registerPlugins(app);
registerDirectives(app);
initSentry(app);

app.mount('#app');

export default app;
