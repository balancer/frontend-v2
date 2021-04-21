<template>
  <div id="lineChartHeader">
    <h3 class="text-gray-800 font-semibold text-xl tracking-wider">$10,000</h3>
    <span class="font-medium">+5.55%</span>
  </div>
  <div ref="lineChart" class="w-full h-96" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import * as echarts from 'echarts/core';

import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts/types/dist/shared';

const LineChartConfig: EChartsOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    show: false
  },
  yAxis: {
    type: 'value',
    show: false
  },
  color: ['#07C808'],
  grid: {
    // top: '35%'
    left: -50,
    right: 0,
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: false,
      symbol: 'none',
      lineStyle: {
        width: 3
      }
    }
  ]
};

export default defineComponent({
  props: {
    axis: {
      type: Array,
      required: true,
      default: () => []
    },
    data: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  setup() {
    const chartInstance = ref<echarts.ECharts>();
    const lineChart = ref<HTMLElement>();

    onMounted(() => {
      // Register the tree-shaken components that echarts needs for a line chart.
      echarts.use([
        TitleComponent,
        TooltipComponent,
        CanvasRenderer,
        LineChart,
        GridComponent
      ]);

      // Register the echarts instance to the DOM
      if (lineChart.value) {
        chartInstance.value = echarts.init(lineChart.value);
        chartInstance.value.setOption(LineChartConfig);
        console.log('esketit');
      }

      window.onresize = () => {
        if (chartInstance.value) {
          chartInstance.value.clear();
          chartInstance.value.resize();
          chartInstance.value.setOption(LineChartConfig);
        }
      };
    });

    return {
      chartInstance,
      lineChart
    };
  }
});
</script>
