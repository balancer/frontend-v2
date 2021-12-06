<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import { format } from 'date-fns';

import { FullPool, PoolSnapshots } from '@/services/balancer/subgraph/types';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';

import useTailwind from '@/composables/useTailwind';
import useDarkMode from '@/composables/useDarkMode';
import { isStablePhantom } from '@/composables/usePool';

/**
 * TYPES
 */
type Props = {
  prices: HistoricalPrices;
  snapshots: PoolSnapshots;
  loading: boolean;
  pool: FullPool;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * STATE
 */
const { prices, snapshots, pool } = toRefs(props);
const MIN_CHART_VALUES = 7;

/**
 * COMPOSABLES
 */
const store = useStore();
const { t } = useI18n();
const tailwind = useTailwind();
const { darkMode } = useDarkMode();

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
  isStablePhantom(pool.value.poolType)
);

const appLoading = computed(() => store.state.app.loading);

const history = computed(() => {
  const pricesTimestamps = Object.keys(prices.value);
  const snapshotsTimestamps = Object.keys(snapshots.value);

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

      const snapshot = snapshots.value[timestamp];
      const price = prices.value[timestamp] ?? [0, 0];
      const amounts = snapshot.amounts ?? ['0', '0'];
      const totalShares = parseFloat(snapshot.totalShares) ?? 0;
      const liquidity = parseFloat(snapshot.liquidity) ?? 0;

      return {
        timestamp,
        price,
        amounts,
        totalShares,
        liquidity
      };
    })
    .filter(state => state.totalShares > 0);
});

const timestamps = computed(() =>
  history.value.map(state => format(state.timestamp, 'yyyy/MM/dd'))
);

const hodlValues = computed(() => {
  if (history.value.length === 0) {
    return [];
  }

  const firstState = history.value[0];
  const firstValue = getPoolValue(firstState.amounts, firstState.price);

  return history.value.map(state => {
    if (state.timestamp < firstState.timestamp) {
      return 0;
    }

    const currentValue = getPoolValue(firstState.amounts, state.price);

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
    : getPoolValue(firstState.amounts, firstState.price);
  const firstShares = firstState.totalShares;
  const firstValuePerBpt = firstValue / firstShares;

  return history.value.map(state => {
    if (state.timestamp < firstState.timestamp) {
      return 0;
    }

    const currentValue = supportsPoolLiquidity.value
      ? state.liquidity
      : getPoolValue(state.amounts, state.price);
    const currentShares = state.totalShares;
    const currentValuePerBpt = currentValue / currentShares;

    return currentValuePerBpt / firstValuePerBpt - 1;
  });
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
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else-if="history.length >= MIN_CHART_VALUES">
    <BalLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{ yAxis: '0.00%' }"
      :color="chartColors"
      height="96"
      :showLegend="true"
      :legendState="{ HODL: false }"
      hide-y-axis
    />
  </div>
  <BalBlankSlate v-else class="h-96">
    <BalIcon name="bar-chart" />
    {{ $t('insufficientData') }}
  </BalBlankSlate>
</template>
