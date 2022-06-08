<script setup lang="ts">
import { Plugin } from 'chart.js';
import { PropType } from 'vue';
import { Line } from 'vue-chartjs';

defineProps({
  data: {
    type: Object
  },
  labels: {
    type: Array as PropType<string[]>
  },
  chartOptions: {
    type: Object
  },
  chartId: {
    type: String,
    default: 'line-chart'
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 400
  },
  cssClasses: {
    default: '',
    type: String
  },
  styles: {
    type: Object as PropType<Partial<CSSStyleDeclaration>>,
    default: () => ({})
  },
  plugins: {
    type: Array as PropType<Plugin<'line'>[]>,
    default: () => []
  }
});
</script>

<template>
  <Line
    :chart-options="chartOptions"
    :chart-data="data"
    :styles="styles"
    :chart-id="chartId"
    :height="height"
  />
</template>
