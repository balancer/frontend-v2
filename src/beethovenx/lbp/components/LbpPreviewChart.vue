<script setup lang="ts">
import LbpLineChart from '@/beethovenx/lbp/components/LbpLineChart.vue';
import { computed } from 'vue';
import useTailwind from '@/composables/useTailwind';
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import {
  getLbpPreviewChartPredictedPriceData,
  getLbpNumDays
} from '@/beethovenx/lbp/utils/lbpChartUtils';
import useTokens from '@/composables/useTokens';

const { data, lgeChartConfigValid } = useLgeCreateState();
const tailwind = useTailwind();
const { priceFor } = useTokens();

const xAxisFormat = computed(() => {
  const numDays = getLbpNumDays(data.value);

  return numDays < 4 ? 'd MMM HH:mm' : 'd MMM';
});

const series = computed(() => {
  const price = priceFor(data.value.collateralTokenAddress);

  return [
    {
      name: 'Predicted Price',
      values:
        lgeChartConfigValid.value === true
          ? getLbpPreviewChartPredictedPriceData(data.value, price)
          : []
    }
  ];
});
</script>

<template>
  <div class="chart mr-n2 ml-n2">
    <LbpLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{ yAxis: '$0.000', xAxis: 'datetime' }"
      :color="[tailwind.theme.colors.green['400']]"
      :legendState="{}"
      height="96"
      :showLegend="true"
      :disable-animation="true"
      :x-axis-format="xAxisFormat"
    />
  </div>
</template>
