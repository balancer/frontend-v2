<script setup lang="ts">
import { format } from 'date-fns';
import { zip } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import BalBarChart from '@/components/_global/BalBarChart/BalBarChart.vue';
import useDarkMode from '@/composables/useDarkMode';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
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
const hodlColor = computed(() =>
  darkMode.value
    ? tailwind.theme.colors.gray['600']
    : tailwind.theme.colors.black
);

const chartColors = computed(() => [
  tailwind.theme.colors.green['400'],
  hodlColor.value
]);

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

const timestamps = computed(() =>
  history.value.map(state => format(state.timestamp, 'yyyy/MM/dd'))
);

const hodlValues = computed(() => {
  if (history.value.length === 0) {
    return [];
  }

  const firstState = history.value[0];
  const firstValue = getPoolValue(firstState.amounts, firstState.prices);

  return history.value.map(state => {
    if (state.timestamp < firstState.timestamp) {
      return 0;
    }

    const currentValue = getPoolValue(firstState.amounts, state.prices);

    return currentValue / firstValue - 1;
  });
});

const bptValues = computed(() => {
  if (history.value.length === 0) {
    return [];
  }

  const firstState = history.value[0];
  const firstValue = supportsPoolLiquidity.value
    ? firstState.liquidity
    : getPoolValue(firstState.amounts, firstState.prices);
  const firstShares = firstState.totalShares;
  const firstValuePerBpt = firstValue / firstShares;

  return history.value.map(state => {
    if (state.timestamp < firstState.timestamp) {
      return 0;
    }

    const currentValue = supportsPoolLiquidity.value
      ? state.liquidity
      : getPoolValue(state.amounts, state.prices);
    const currentShares = state.totalShares;
    const currentValuePerBpt = currentValue / currentShares;

    return currentValuePerBpt / firstValuePerBpt - 1;
  });
});

const volumeData = computed(() => {
  const values = Object.values(props.snapshots).reverse();
  return values.map((snapshot, idx) => {
    const prevValue = idx === 0 ? 0 : parseFloat(values[idx - 1].swapVolume);
    const value = parseFloat(snapshot.swapVolume);

    return { x: 10, y: value - prevValue > 0 ? value - prevValue : 0 };
  });
});

const feesData = computed(() => {
  const values = Object.values(props.snapshots).reverse();
  return values.map((snapshot, idx) => {
    const prevValue = idx === 0 ? 0 : parseFloat(values[idx - 1].swapFees);
    const value = parseFloat(snapshot.swapFees);

    return value - prevValue > 0 ? value - prevValue : 0;
  });
});

const chartData = computed(() => {
  if (activeTab.value === PoolChartTab.TVL) {
    return {
      label: 'TVL',
      backgroundColor: '#6ad09d',
      data: Object.values(props.snapshots)
        .reverse()
        .map(snapshot => snapshot.liquidity)
    };
  }
  if (activeTab.value === PoolChartTab.FEES) {
    return {
      label: 'Fees',
      backgroundColor: '#6ad09d',
      data: feesData.value
    };
  }

  return {
    label: '',
    backgroundColor: '#6ad09d',
    data: volumeData.value
  };
});

const series = computed(() => {
  // TODO: currently HODL series is disabled when using pool liquidity
  const supportsHODLSeries = !supportsPoolLiquidity.value;

  const chartSeries = [
    {
      name: t('poolReturns'),
      values: zip(timestamps.value, bptValues.value)
    }
  ];

  if (supportsHODLSeries) {
    chartSeries.push({
      name: 'HODL',
      values: zip(timestamps.value, hodlValues.value)
    });
  }

  return chartSeries;
});

/**
 * METHODS
 */
function getPoolValue(amounts: string[], prices: number[]) {
  return amounts
    .map((amount, index) => {
      const price = prices[index];

      return price * parseFloat(amount);
    })
    .reduce((total, value) => total + value, 0);
}

function showTooltip(context: any) {
  console.log(context);
  return fNum2(context.parsed.y, FNumFormats.fiat);
}

const plugins = {
  legend: {
    display: false
  },
  tooltip: {
    callbacks: {
      label: showTooltip,
      formattedValue: 'kek'
    }
  }
};
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else-if="history.length >= MIN_CHART_VALUES">
    <div
      class="px-4 sm:px-0 flex justify-between items-end border-b dark:border-gray-900 mb-6"
    >
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
    </div>

    <BalBarChart
      :data="{
        labels: timestamps,
        datasets: [chartData]
      }"
      :chart-options="{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              display: false
            },
            grid: {
              display: false,
              drawTicks: false,
              drawOnChartArea: false
            }
          },
          x: {
            ticks: {
              display: true
            },
            grid: {
              display: true,
              drawTicks: true,
              drawOnChartArea: false
            }
          }
        },
        tooltips: {
          enabled: false
        },
        plugins
      }"
      :styles="chartColors"
      chart-id="1"
      :height="146"
    />
  </div>
  <BalBlankSlate v-else class="h-96">
    <BalIcon name="bar-chart" />
    {{ $t('insufficientData') }}
  </BalBlankSlate>
</template>
