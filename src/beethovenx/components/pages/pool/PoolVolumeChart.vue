<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as echarts from 'echarts/core';
import useNumbers from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import { format, fromUnixTime } from 'date-fns';
import numeral from 'numeral';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import ECharts from 'vue-echarts';
import BalBlankSlate from '@/components/_global/BalBlankSlate/BalBlankSlate.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import { GqlBalancerPoolSnapshot } from '@/beethovenx/services/beethovenx/beethovenx-types';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import { capitalize } from 'lodash';

type Props = {
  snapshots: GqlBalancerPoolSnapshot[];
};

/**
 * PROPS
 */
const props = defineProps<Props>();

const chartInstance = ref<echarts.ECharts>();
const { fNum } = useNumbers();
const tailwind = useTailwind();
type ChartType = 'volume' | 'tvl' | 'fees';
const currentChartType = ref<ChartType>('volume');

const chartLabel = computed(() => {
  switch (currentChartType.value) {
    case 'volume':
      return 'Volume';
    case 'fees':
      return 'Fees';
    case 'tvl':
      return 'TVL';
  }

  return '';
});

const chartConfig = computed(() => {
  return {
    color: '#2172E5',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tailwind.theme.colors.gray['800'],
      borderColor: tailwind.theme.colors.gray['800'],
      formatter: params => {
        return `
            <div class='flex flex-col font-body bg-white dark:bg-gray-800 dark:text-white'>
              ${params
                .map(
                  param => `
                <div class="flex items-center">
                ${param.marker} <div class="flex-1">${
                    param.seriesName
                  }</div> <div class='font-medium ml-4'>${fNum(
                    param.value,
                    'usd'
                  )}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    width: '100%',
    grid: {
      left: 0,
      right: '2.5%',
      top: '4%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: props.snapshots.map(snapshot =>
          format(fromUnixTime(snapshot.timestamp), 'MMM. d')
        ),
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: {
      type: 'value',
      axisLine: {
        onZero: false,
        lineStyle: { color: tailwind.theme.colors.gray['600'] }
      },
      axisLabel: {
        color: tailwind.theme.colors.gray[300],
        fontSize: 14,
        formatter: value =>
          `$${numeral(value).format(value > 1000 ? '0.[0]a' : '0.[00]')}`
      },
      splitLine: {
        lineStyle: {
          color: tailwind.theme.colors.gray['700']
        }
      }
    },
    series: [
      {
        name: chartLabel.value,
        type: 'bar',
        barWidth: '80%',
        data: props.snapshots.map(snapshot => {
          switch (currentChartType.value) {
            case 'volume':
              return parseFloat(snapshot.swapVolume24h);
            case 'fees':
              return parseFloat(snapshot.swapFees24h);
            case 'tvl':
              return parseFloat(snapshot.totalLiquidity);
          }
        }),
        itemStyle: { borderRadius: 4 }
      }
    ]
  };
});

function setCurrentChart(chartType: ChartType) {
  currentChartType.value = chartType;
  //
}
</script>

<template>
  <BalCard no-content-pad class="px-4 pt-4">
    <template v-if="props.snapshots.length > 2">
      <div class="flex justify-end">
        <div class="toggle-container">
          <div
            :class="[
              'toggle-button',
              currentChartType === 'volume' ? 'toggle-button-active' : ''
            ]"
            @click="setCurrentChart('volume')"
          >
            Volume
          </div>
          <div
            :class="[
              'toggle-button',
              currentChartType === 'tvl' ? 'toggle-button-active' : ''
            ]"
            @click="setCurrentChart('tvl')"
          >
            TVL
          </div>
          <div
            :class="[
              'toggle-button',
              currentChartType === 'fees' ? 'toggle-button-active' : ''
            ]"
            @click="setCurrentChart('fees')"
          >
            Fees
          </div>
        </div>
      </div>
      <ECharts
        ref="chartInstance"
        class="w-full h-96"
        :option="chartConfig"
        autoresize
        :update-options="{ replaceMerge: 'series' }"
      />
    </template>
    <BalBlankSlate v-else class="mb-4">
      <BalIcon name="bar-chart" />
      <span class="dark:text-white">
        {{ $t('insufficientData') }}
      </span>
    </BalBlankSlate>
  </BalCard>
</template>

<style scoped>
.toggle-container {
  @apply py-1 px-1 flex items-center rounded-full bg-gray-700;
}
.toggle-button {
  @apply text-sm rounded-full px-4 py-0.5 cursor-pointer;
}
.toggle-button-active {
  @apply bg-black;
}
</style>
