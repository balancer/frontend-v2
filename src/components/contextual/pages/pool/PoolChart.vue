<script setup lang="ts">
import { format } from 'date-fns';
import * as echarts from 'echarts/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useNumbers from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { Pool, PoolSnapshot, PoolSnapshots } from '@/services/pool/types';

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

interface PoolChartData {
  color: string[];
  hoverBorderColor?: string;
  hoverColor?: string;
  areaStyle?: {
    color: echarts.LinearGradientObject;
  };
  chartType: string;
  data: {
    name: string;
    values: (string | number)[][];
  }[];
  defaultHeaderStateValue: string;
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
const { fNum2 } = useNumbers();
const { isMobile } = useBreakpoints();
const { darkMode } = useDarkMode();

/**
 * STATE
 */
const MIN_CHART_VALUES = 2;

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
const activeTab = ref(tabs[0].value);

const currentChartValue = ref('');
const currentChartDate = ref('');
const isFocusedOnChart = ref(false);

/**
 * COMPUTED
 */
const appLoading = computed(() => store.state.app.loading);

const snapshotValues = computed(() => Object.values(props.snapshots || []));

const periodOptions = computed(() => [
  { text: t('poolChart.period.days', [90]), value: 90 },
  { text: t('poolChart.period.days', [180]), value: 180 },
  { text: t('poolChart.period.days', [365]), value: 365 },
  { text: t('poolChart.period.all'), value: snapshotValues.value.length }
]);

const currentPeriod = ref(90);

const timestamps = computed(() =>
  snapshotValues.value.map(snapshot => format(snapshot.timestamp, 'yyyy/MM/dd'))
);

function getTVLData(periodSnapshots: PoolSnapshot[]) {
  const tvlValues = periodSnapshots.map((snapshot, idx) => {
    const timestamp = timestamps.value[idx];
    const prices = props.historicalPrices[snapshot.timestamp];
    const amounts = snapshot.amounts;
    const snapshotPoolValue = amounts.reduce(
      (sum: number, amount: string, index: number) => {
        sum += Number(amount) * (prices && prices[index] ? prices[index] : 0);
        return sum;
      },
      0
    );
    return [timestamp, snapshotPoolValue];
  });

  // get today's TVL value from pool.totalLiquidity due to differences in prices during the day
  tvlValues[0][1] = Number(props.pool.totalLiquidity);

  return {
    color: [tailwind.theme.colors.blue['600']],
    hoverBorderColor: tailwind.theme.colors.pink['500'],
    hoverColor: darkMode.value
      ? tailwind.theme.colors.gray['900']
      : tailwind.theme.colors.white,
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
    ],
    defaultHeaderStateValue: fNum2(tvlValues[0][1], {
      style: 'currency'
    })
  };
}

function getFeesData(
  periodSnapshots: PoolSnapshot[],
  isAllTimeSelected: boolean,
  pariodLastSnapshotIdx: number
) {
  const feesValues = periodSnapshots.map((snapshot, idx) => {
    const value = parseFloat(snapshot.swapFees);
    let prevValue: number;

    // get value of prev snapshot
    // if it is last value among all snapshots, then prev value is 0
    if (idx === snapshotValues.value.length - 1) {
      prevValue = 0;
    } // if it is last value among certain period snapshots, then we get prev value from all snapshots
    else if (idx === pariodLastSnapshotIdx) {
      prevValue = parseFloat(snapshotValues.value[idx + 1].swapFees);
    } else {
      prevValue = parseFloat(periodSnapshots[idx + 1].swapFees);
    }
    return [timestamps.value[idx], value - prevValue];
  });
  const defaultHeaderStateValue =
    Number(periodSnapshots[0].swapFees) -
    (isAllTimeSelected
      ? 0
      : Number(periodSnapshots[pariodLastSnapshotIdx].swapFees));

  return {
    color: [tailwind.theme.colors.yellow['400']],
    chartType: 'bar',
    hoverColor: tailwind.theme.colors.pink['500'],
    data: [
      {
        name: 'Fees',
        values: feesValues
      }
    ],
    defaultHeaderStateValue: fNum2(defaultHeaderStateValue, {
      style: 'currency'
    })
  };
}

function getVolumeData(
  periodSnapshots: PoolSnapshot[],
  isAllTimeSelected: boolean,
  pariodLastSnapshotIdx: number
): PoolChartData {
  const volumeData = periodSnapshots.map((snapshot, idx) => {
    const value = parseFloat(snapshot.swapVolume);
    let prevValue: number;

    // get value of prev snapshot
    if (idx === snapshotValues.value.length - 1) {
      prevValue = 0;
    } else if (idx === pariodLastSnapshotIdx) {
      prevValue = parseFloat(snapshotValues.value[idx + 1].swapVolume);
    } else {
      prevValue = parseFloat(periodSnapshots[idx + 1].swapVolume);
    }
    return [timestamps.value[idx], value - prevValue];
  });

  const defaultHeaderStateValue =
    Number(periodSnapshots[0].swapVolume) -
    (isAllTimeSelected
      ? 0
      : Number(periodSnapshots[pariodLastSnapshotIdx].swapVolume));

  return {
    color: [tailwind.theme.colors.green['400']],
    chartType: 'bar',
    hoverColor: tailwind.theme.colors.pink['500'],
    data: [
      {
        name: 'Volume',
        values: volumeData
      }
    ],
    defaultHeaderStateValue: fNum2(defaultHeaderStateValue, {
      style: 'currency'
    })
  };
}

const chartData = computed(
  (): PoolChartData => {
    const periodSnapshots =
      currentPeriod.value === snapshotValues.value.length
        ? snapshotValues.value
        : snapshotValues.value.slice(0, currentPeriod.value - 1);
    const isAllTimeSelected =
      periodSnapshots.length === snapshotValues.value.length;
    const pariodLastSnapshotIdx = periodSnapshots.length - 1;

    if (activeTab.value === PoolChartTab.TVL) {
      return getTVLData(periodSnapshots);
    }

    if (activeTab.value === PoolChartTab.FEES) {
      return getFeesData(
        periodSnapshots,
        isAllTimeSelected,
        pariodLastSnapshotIdx
      );
    }

    return getVolumeData(
      periodSnapshots,
      isAllTimeSelected,
      pariodLastSnapshotIdx
    );
  }
);

const defaultChartData = computed(() => {
  const currentPeriodOption = periodOptions.value.find(
    option => option.value === currentPeriod.value
  );
  let title = `${currentPeriodOption?.text} ${activeTab.value}`;

  if (activeTab.value === PoolChartTab.TVL) {
    title = t('poolChart.defaultTitle.tvl');
  }

  return { title, value: chartData.value.defaultHeaderStateValue };
});

/**
 * METHODS
 */
function setCurrentPeriod(period: string) {
  currentPeriod.value = Number(period);
}

function setCurrentChartValue(payload: {
  chartDate: string;
  chartValue: number;
}) {
  currentChartValue.value = fNum2(payload.chartValue, {
    style: 'currency'
  });
  currentChartDate.value = format(
    new Date(payload.chartDate),
    PRETTY_DATE_FORMAT
  );
}
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart" v-else-if="snapshotValues.length >= MIN_CHART_VALUES">
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
          {{ isFocusedOnChart ? currentChartValue : defaultChartData.value }}
        </p>
        <div
          class="text-sm font-medium text-gray-500"
          :class="{ 'text-pink-500': isFocusedOnChart }"
        >
          <p class="tracking-tighter">
            {{ isFocusedOnChart ? currentChartDate : defaultChartData.title }}
          </p>
        </div>
      </div>
    </div>

    <BalChart
      height="96"
      :data="chartData.data"
      :axis-label-formatter="{
        yAxis: { style: 'currency', abbreviate: true, maximumFractionDigits: 0 }
      }"
      :area-style="chartData.areaStyle"
      :color="chartData.color"
      :hover-color="chartData.hoverColor"
      :hover-border-color="chartData.hoverBorderColor"
      :x-axis-min-interval="3600 * 1000 * 24 * 30"
      :show-legend="false"
      need-chart-value
      :chart-type="chartData.chartType"
      :show-tooltip-layer="false"
      @setCurrentChartValue="setCurrentChartValue"
      :hide-y-axis="isMobile"
      @mouseLeaveEvent="isFocusedOnChart = false"
      @mouseEnterEvent="isFocusedOnChart = true"
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
