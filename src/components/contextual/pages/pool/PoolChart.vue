<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import BalBarChart from '@/components/_global/BalBarChart/BalBarChart.vue';
import BalLineChart from '@/components/_global/BalLineChart/BalLineChart.vue';
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
    const tvlValues = values.map((snapshot, idx) => [
      timestamps.value[idx],
      snapshot.liquidity
    ]);
    return {
      color: [tailwind.theme.colors.blue['600']],
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
      return [timestamps.value[idx], value - nextValue];
    });
    return {
      color: [tailwind.theme.colors.yellow['400']],
      hoverColor: tailwind.theme.colors.green['400'],
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
    return [timestamps.value[idx], value - nextValue];
  });

  return {
    color: [tailwind.theme.colors.green['400']],
    hoverColor: tailwind.theme.colors.yellow['400'],
    data: [
      {
        name: 'Volume',
        values: volumeData
      }
    ]
  };
});
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else-if="history.length >= MIN_CHART_VALUES">
    <div class="px-4 sm:px-0 flex justify-between dark:border-gray-900 mb-6">
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
      <div class="w-24">
        <BalSelectInput
          :options="periodOptions"
          :model-value="currentPeriod.toString()"
          @change="setCurrentPeriod"
          name="periods"
        />
      </div>
    </div>

    <BalLineChart
      v-if="activeTab === PoolChartTab.TVL"
      :data="chartData.data"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{
        yAxis: {
          style: 'currency'
        }
      }"
      :color="chartData.color"
      height="96"
      hide-y-axis
    />
    <BalBarChart
      v-else
      :data="chartData.data"
      :isPeriodSelectionEnabled="false"
      :showLegend="false"
      :axisLabelFormatter="{
        yAxis: { style: 'currency', abbreviate: true }
      }"
      :color="chartData.color"
      :hoverColor="chartData.hoverColor"
      height="96"
    />
  </div>
  <BalBlankSlate v-else class="h-96">
    <BalIcon name="bar-chart" />
    {{ $t('insufficientData') }}
  </BalBlankSlate>
</template>
