<script setup lang="ts">
import { format, addMinutes } from 'date-fns';
import * as echarts from 'echarts/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import PoolChartPeriodSelect from '@/components/pool/PoolChartPeriodSelect.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useNumbers from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { PoolSnapshot, PoolSnapshots, PoolType } from '@/services/pool/types';

/**
 * TYPES
 */
export type PoolChartPeriod = {
  text: string;
  days: number;
};

type Props = {
  historicalPrices?: HistoricalPrices | null;
  snapshots?: PoolSnapshots | null;
  loading: boolean;

  // these props are added to prevent line chart rerender on each pool update
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  totalLiquidity?: string;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  tokensList?: string[];
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  poolType?: PoolType;
};

enum PoolChartTab {
  VOLUME = 'volume',
  TVL = 'tvl',
  FEES = 'fees',
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
    values: (readonly [string, number])[];
  }[];
  defaultHeaderStateValue: string;
}

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  historicalPrices: null,
  snapshots: null,
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
    label: t('poolChart.tabs.volume'),
  },
  {
    value: PoolChartTab.TVL,
    label: t('poolChart.tabs.tvl'),
  },
  {
    value: PoolChartTab.FEES,
    label: t('poolChart.tabs.fees'),
  },
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
  { text: t('poolChart.period.days', [90]), days: 90 },
  { text: t('poolChart.period.days', [180]), days: 180 },
  { text: t('poolChart.period.days', [365]), days: 365 },
  { text: t('poolChart.period.all'), days: snapshotValues.value.length },
]);

const currentPeriod = ref<PoolChartPeriod>(periodOptions.value[0]);

const timestamps = computed(() =>
  snapshotValues.value.map(snapshot =>
    format(
      addMinutes(
        snapshot.timestamp,
        new Date(snapshot.timestamp).getTimezoneOffset()
      ),
      'yyyy/MM/dd'
    )
  )
);

function getTVLData(periodSnapshots: PoolSnapshot[]) {
  const tvlValues: (readonly [string, number])[] = [];

  // temporary statement until we start get prices from coingecko for
  if (props.poolType === PoolType.StablePhantom) {
    periodSnapshots.forEach((snapshot, idx) => {
      const timestamp = timestamps.value[idx];
      if (idx === 0) {
        tvlValues.push(
          Object.freeze<[string, number]>([
            timestamp,
            Number(props.totalLiquidity || 0),
          ])
        );
        return;
      }
      tvlValues.push(
        Object.freeze<[string, number]>([timestamp, Number(snapshot.liquidity)])
      );
    });
  } else {
    periodSnapshots.forEach((snapshot, idx) => {
      const timestamp = timestamps.value[idx];
      // get today's TVL value from pool.totalLiquidity due to differences in prices during the day
      if (idx === 0) {
        tvlValues.push(
          Object.freeze<[string, number]>([
            timestamp,
            Number(props.totalLiquidity || 0),
          ])
        );
        return;
      }

      const prices =
        props.historicalPrices && props.historicalPrices[snapshot.timestamp];

      // if there are no prices from coingecko use snapshot.liquidity
      if (!prices || prices.length < (props.tokensList?.length || 0)) {
        tvlValues.push(
          Object.freeze<[string, number]>([
            timestamp,
            Number(snapshot.liquidity),
          ])
        );
        return;
      }

      let amounts = [...snapshot.amounts];

      /**
       * @description
       * There may be more amounts in snapshots than prices.
       * For example in balancer boosted pool the largest one is the BPT of the pool itself.
       * It is removed here to calculate properly snapshot pool value.
       */
      if (snapshot.amounts.length > prices.length) {
        const maxValue = Math.max(
          ...snapshot.amounts.map(amount => Number(amount))
        );

        amounts = amounts.filter(
          amount => Number(amount).toFixed() !== maxValue?.toString()
        );
      }

      const snapshotPoolValue = amounts.reduce(
        (sum: number, amount: string, index: number) => {
          sum += Number(amount) * prices[index];
          return sum;
        },
        0
      );

      tvlValues.push(
        Object.freeze<[string, number]>([timestamp, snapshotPoolValue])
      );
    });
  }

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
          color: 'rgba(14, 165, 233, 0.08)',
        },
        {
          offset: 1,
          color: 'rgba(68, 9, 236, 0)',
        },
      ]),
    },
    chartType: 'line',
    data: [
      {
        name: 'TVL',
        values: tvlValues,
      },
    ],
    defaultHeaderStateValue: fNum2(tvlValues[0][1], {
      style: 'currency',
    }),
  };
}

function getFeesData(
  periodSnapshots: PoolSnapshot[],
  isAllTimeSelected: boolean,
  pariodLastSnapshotIdx: number
) {
  const feesValues = periodSnapshots.map(
    (snapshot, idx): readonly [string, number] => {
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
      const result = Object.freeze<[string, number]>([
        timestamps.value[idx],
        value - prevValue,
      ]);
      return result;
    }
  );

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
        values: feesValues,
      },
    ],
    defaultHeaderStateValue: fNum2(defaultHeaderStateValue, {
      style: 'currency',
    }),
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
    return Object.freeze<[string, number]>([
      timestamps.value[idx],
      value - prevValue,
    ]);
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
        values: volumeData,
      },
    ],
    defaultHeaderStateValue: fNum2(defaultHeaderStateValue, {
      style: 'currency',
    }),
  };
}

const chartData = computed((): PoolChartData => {
  const periodSnapshots =
    currentPeriod.value.days === snapshotValues.value.length
      ? snapshotValues.value
      : snapshotValues.value.slice(0, currentPeriod.value.days - 1);
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
});

const defaultChartData = computed(() => {
  const currentPeriodOption = periodOptions.value.find(
    option => option.days === currentPeriod.value.days
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
function setCurrentPeriod(period: PoolChartPeriod) {
  currentPeriod.value = period;
}

function setCurrentChartValue(payload: {
  chartDate: string;
  chartValue: number;
}) {
  currentChartValue.value = fNum2(payload.chartValue, {
    style: 'currency',
  });
  currentChartDate.value = format(
    new Date(payload.chartDate),
    PRETTY_DATE_FORMAT
  );
}
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />

  <div v-else-if="snapshotValues.length >= MIN_CHART_VALUES" class="chart">
    <div
      class="flex flex-col xs:flex-row xs:flex-wrap justify-between mb-6 dark:border-gray-900"
    >
      <div class="flex mb-4">
        <BalTabs v-model="activeTab" :tabs="tabs" noPad class="mr-6 -mb-px" />
        <div class="flex items-center">
          <PoolChartPeriodSelect
            :options="periodOptions"
            :activeOption="currentPeriod"
            @change-option="setCurrentPeriod"
          />
        </div>
      </div>
      <div
        class="flex flex-col items-start xs:items-end text-2xl font-semibold tabular-nums"
      >
        <p class="tracking-tighter">
          {{ isFocusedOnChart ? currentChartValue : defaultChartData.value }}
        </p>
        <div
          class="text-sm font-medium text-secondary"
          :class="{ 'text-pink-500': isFocusedOnChart }"
        >
          <p>
            {{ isFocusedOnChart ? currentChartDate : defaultChartData.title }}
          </p>
        </div>
      </div>
    </div>
    <BalBlankSlate
      v-if="chartData.data[0].values.length <= MIN_CHART_VALUES"
      class="h-96"
    >
      <BalIcon name="bar-chart" />
      {{ $t('noPriceInfo') }}
    </BalBlankSlate>
    <BalChart
      v-else
      height="96"
      :data="chartData.data"
      :axisLabelFormatter="{
        yAxis: {
          style: 'currency',
          abbreviate: true,
          maximumFractionDigits: 0,
        },
      }"
      :areaStyle="chartData.areaStyle"
      :color="chartData.color"
      :hoverColor="chartData.hoverColor"
      :hoverBorderColor="chartData.hoverBorderColor"
      :xAxisMinInterval="3600 * 1000 * 24 * 30"
      :showLegend="false"
      needChartValue
      :chartType="chartData.chartType"
      :showTooltipLayer="false"
      :hideYAxis="isMobile"
      @set-current-chart-value="setCurrentChartValue"
      @mouse-leave-event="isFocusedOnChart = false"
      @mouse-enter-event="isFocusedOnChart = true"
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
