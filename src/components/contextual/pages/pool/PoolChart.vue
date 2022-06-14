<script setup lang="ts">
import { format } from 'date-fns';
import * as echarts from 'echarts/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import useDarkMode from '@/composables/useDarkMode';
import useNumbers from '@/composables/useNumbers';
import { isStablePhantom } from '@/composables/usePool';
import useTailwind from '@/composables/useTailwind';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { Pool, PoolSnapshots } from '@/services/pool/types';
/**
 * TYPES
 */
type Props = {
  historicalPrices: HistoricalPrices;
  snapshots: PoolSnapshots;
  loading: boolean;
  pool: Pool;
};

enum PoolChartTab {
  VOLUME = 'volume',
  TVL = 'tvl',
  FEES = 'fees'
}

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * COMPOSABLES
 */
const store = useStore();
const { t } = useI18n();
const tailwind = useTailwind();
const { darkMode } = useDarkMode();
const { fNum2 } = useNumbers();

/**
 * STATE
 */
const tabs = [
  {
    value: PoolChartTab.VOLUME,
    label: t('poolChart.tabs.volume')
  },
  {
    value: PoolChartTab.TVL,
    label: t('poolChart.tabs.tvl')
  },
  {
    value: PoolChartTab.FEES,
    label: t('poolChart.tabs.fees')
  }
];
const MIN_CHART_VALUES = 7;
const activeTab = ref(tabs[0].value);

/**
 * COMPUTED
 */
// const hodlColor = computed(() =>
//   darkMode.value
//     ? tailwind.theme.colors.gray['600']
//     : tailwind.theme.colors.black
// );

// const chartColors = computed(() => [
//   tailwind.theme.colors.green['400'],
//   hodlColor.value
// ]);

const supportsPoolLiquidity = computed(() =>
  isStablePhantom(props.pool.poolType)
);

const appLoading = computed(() => store.state.app.loading);

const history = computed(() => {
  if (!props.historicalPrices) return [];

  const pricesTimestamps = Object.keys(props.historicalPrices);
  const snapshotsTimestamps = Object.keys(props.snapshots);

  if (snapshotsTimestamps.length === 0) {
    return [];
  }

  // Prices are required when not using pool liquidity
  if (!supportsPoolLiquidity.value && pricesTimestamps.length === 0) {
    return [];
  }

  return snapshotsTimestamps
    .map(snapshotTimestamp => {
      const timestamp = parseInt(snapshotTimestamp);

      const snapshot = props.snapshots[timestamp];
      const prices = props.historicalPrices[timestamp] ?? [];
      const amounts = snapshot.amounts ?? [];
      const totalShares = parseFloat(snapshot.totalShares) ?? 0;
      const liquidity = parseFloat(snapshot.liquidity) ?? 0;

      return {
        timestamp,
        prices,
        amounts,
        totalShares,
        liquidity
      };
    })
    .filter(({ totalShares, prices, amounts, liquidity }) => {
      if (!supportsPoolLiquidity.value && prices.length === 0) {
        return false;
      } else if (supportsPoolLiquidity.value && liquidity === 0) {
        return false;
      }
      return totalShares > 0 && amounts.length > 0;
    })
    .reverse();
});

const snapshotValues = computed(() => Object.values(props.snapshots || {}));
const periodOptions = computed(() => {
  const maxPeriodLengh = snapshotValues.value.length;
  const arr = [{ text: 'All time', value: snapshotValues.value.length }];
  if (maxPeriodLengh > 365) {
    arr.unshift({ text: '365 days', value: 365 });
  }
  if (maxPeriodLengh > 180) {
    arr.unshift({ text: '180 days', value: 180 });
  }
  if (maxPeriodLengh > 90) {
    arr.unshift({ text: '90 days', value: 90 });
  }

  return arr;
});
const currentPeriod = ref(periodOptions.value[0].value || 90);

function setCurrentPeriod(period: string) {
  currentPeriod.value = Number(period);
}

const timestamps = computed(() =>
  Object.values(props.snapshots).map(snapshot =>
    format(snapshot.timestamp, 'yyyy/MM/dd')
  )
);

const chartData = computed(() => {
  const values = snapshotValues.value.slice(0, currentPeriod.value - 1);

  if (activeTab.value === PoolChartTab.TVL) {
    const tvlValues = values.map((snapshot, idx) => ({
      name: timestamps.value[idx],
      value: [timestamps.value[idx], snapshot.liquidity]
    }));
    return {
      color: [tailwind.theme.colors.blue['600']],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(14, 165, 233, 0.08)'
          },
          {
            offset: 1,
            color: 'rgba(68, 9, 236, 0)'
          }
        ])
      },
      chartType: 'line',
      data: [
        {
          name: 'TVL',
          values: tvlValues
        }
      ]
    };
  }

  if (activeTab.value === PoolChartTab.FEES) {
    const feesValues = values.map((snapshot, idx) => {
      const value = parseFloat(snapshot.swapFees);
      let nextValue: number;
      if (idx === snapshotValues.value.length - 1) {
        nextValue = 0;
      } else if (idx === values.length - 1) {
        nextValue = parseFloat(snapshotValues.value[idx + 1].swapFees);
      } else {
        nextValue = parseFloat(values[idx + 1].swapFees);
      }
      return {
        name: timestamps.value[idx],
        value: [timestamps.value[idx], value - nextValue]
      };
    });
    return {
      color: [tailwind.theme.colors.yellow['400']],
      chartType: 'bar',
      hoverColor: tailwind.theme.colors.pink['500'],
      data: [
        {
          name: 'Fees',
          values: feesValues
        }
      ]
    };
  }

  const volumeData = values.map((snapshot, idx) => {
    const value = parseFloat(snapshot.swapVolume);
    let nextValue: number;
    if (idx === snapshotValues.value.length - 1) {
      nextValue = 0;
    } else if (idx === values.length - 1) {
      nextValue = parseFloat(snapshotValues.value[idx + 1].swapVolume);
    } else {
      nextValue = parseFloat(values[idx + 1].swapVolume);
    }
    return {
      name: timestamps.value[idx],
      value: [timestamps.value[idx], value - nextValue]
    };
  });

  return {
    color: [tailwind.theme.colors.green['400']],
    chartType: 'bar',
    hoverColor: tailwind.theme.colors.pink['500'],
    data: [
      {
        name: 'Volume',
        values: volumeData
      }
    ]
  };
});

const currentChartValue = ref('');
const currentChartDate = ref('');
function setCurrentChartValue(value: {
  value: [string, number];
  name: string;
}) {
  currentChartValue.value = fNum2(value.value[1], {
    style: 'currency'
  });
  currentChartDate.value = value.value[0];
}
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart" v-else-if="history.length >= MIN_CHART_VALUES">
    <div
      class="px-4 sm:px-0 flex flex-col xs:flex-row xs:flex-wrap justify-between dark:border-gray-900 mb-6"
    >
      <div class="flex mb-4">
        <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px mr-6" />
        <div class="w-24 flex items-center">
          <BalSelectInput
            :options="periodOptions"
            :model-value="currentPeriod.toString()"
            @change="setCurrentPeriod"
            name="periods"
            no-margin
            class="font-medium cursor-pointer"
          />
        </div>
      </div>
      <div
        class="flex flex-col items-start xs:items-end text-2xl font-bold tabular-nums"
      >
        <p class="tracking-tighter">
          {{ currentChartValue }}
        </p>
        <div class="text-sm	font-medium text-pink-500">
          <p class="tracking-tighter">
            {{ currentChartDate }}
          </p>
        </div>
      </div>
    </div>

    <BalChart
      :data="chartData.data"
      :axisLabelFormatter="{
        yAxis: { style: 'currency', abbreviate: true }
      }"
      :areaStyle="chartData.areaStyle"
      :color="chartData.color"
      :hoverColor="chartData.hoverColor"
      :xAxisMinInterval="3600 * 1000 * 24 * 30"
      @setCurrentChartValue="setCurrentChartValue"
      :showLegend="false"
      needChartValue
      :chartType="chartData.chartType"
      :showTooltipLayer="false"
      height="96"
    />
  </div>
  <BalBlankSlate v-else class="h-96">
    <BalIcon name="bar-chart" />
    {{ $t('insufficientData') }}
  </BalBlankSlate>
</template>
<style scoped>
.chart {
  @apply sm:border rounded-xl sm:px-5 sm:pt-5 sm:shadow sm:dark:bg-gray-850 dark:border-transparent;
}
</style>
