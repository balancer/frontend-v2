let echartsLoaded = false;

import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { use } from 'echarts/core';

export function initEcharts() {
  use([
    TooltipComponent,
    CanvasRenderer,
    LineChart,
    GridComponent,
    LegendComponent,
    BarChart,
    PieChart,
  ]);
  echartsLoaded = true;
}

export function getEcharts() {
  if (!echartsLoaded) {
    initEcharts();
  }
}
