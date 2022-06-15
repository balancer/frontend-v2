<script setup lang="ts">
import { format } from 'date-fns';
import * as echarts from 'echarts/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
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
const { fNum2 } = useNumbers();
const { isMobile } = useBreakpoints();
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
const activeTab = ref(tabs[0].value);

const MIN_CHART_VALUES = 2;
const currentChartValue = ref('');
const currentChartDate = ref('');
const isFocusedOnChart = ref(false);

/**
 * COMPUTED
 */
const appLoading = computed(() => store.state.app.loading);

const snapshotValues = computed(() => Object.values(props.snapshots || []));

const periodOptions = computed(() => {
  const maxPeriodLengh = snapshotValues.value.length;
  const arr = [{ text: t('poolChart.period.all'), value: maxPeriodLengh }];
  if (maxPeriodLengh > 365) {
    arr.unshift({ text: t('poolChart.period.days', [365]), value: 365 });
  }
  if (maxPeriodLengh > 180) {
    arr.unshift({ text: t('poolChart.period.days', [180]), value: 180 });
  }
  if (maxPeriodLengh > 90) {
    arr.unshift({ text: t('poolChart.period.days', [90]), value: 90 });
  }

  return arr;
});

const currentPeriod = ref(periodOptions.value[0].value || 90);

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
      hoverBorderColor: tailwind.theme.colors.pink['500'],
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
      defaultStateValue: fNum2(values[0].liquidity, {
        style: 'currency'
      })
    };
  }

  if (activeTab.value === PoolChartTab.FEES) {
    const feesValues = values.map((snapshot, idx) => {
      const value = parseFloat(snapshot.swapFees);
      let nextValue: number;

      // get value of next snapshot
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
    const defaultStateValue =
      Number(values[0].swapFees) - Number(values[values.length - 1].swapFees);

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
      defaultStateValue: fNum2(defaultStateValue, { style: 'currency' })
    };
  }

  const volumeData = values.map((snapshot, idx) => {
    const value = parseFloat(snapshot.swapVolume);
    let nextValue: number;

    // get value of next snapshot
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

  const defaultStateValue =
    Number(values[0].swapVolume) - Number(values[values.length - 1].swapVolume);

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
    defaultStateValue: fNum2(defaultStateValue, { style: 'currency' })
  };
});

const defaultChartData = computed(() => {
  const currentPeriodOption = periodOptions.value.find(
    option => option.value === currentPeriod.value
  );
  let title = `${currentPeriodOption?.text} ${activeTab.value}`;

  if (activeTab.value === PoolChartTab.TVL) {
    title = t('poolChart.defaultTitle.tvl');
  }

  return { title, value: chartData.value.defaultStateValue };
});

/**
 * METHODS
 */
function setCurrentPeriod(period: string) {
  currentPeriod.value = Number(period);
}

function setCurrentChartValue(value: {
  value: [string, number];
  name: string;
}) {
  currentChartValue.value = fNum2(value.value[1], {
    style: 'currency'
  });
  currentChartDate.value = format(new Date(value.value[0]), PRETTY_DATE_FORMAT);
}
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div
    class="chart mr-n2 ml-n2"
    v-else-if="snapshotValues.length >= MIN_CHART_VALUES"
  >
    <div
      class="px-4 sm:px-0 flex justify-between dark:border-gray-900 mb-6 flex-wrap	"
    >
      <div class="flex mb-4">
        <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px mr-5" />
        <div class="w-24 flex items-center mr-10">
          <BalSelectInput
            :options="periodOptions"
            :model-value="currentPeriod.toString()"
            @change="setCurrentPeriod"
            name="periods"
            no-margin
          />
        </div>
      </div>
      <div class="flex flex-col items-end text-2xl font-bold">
        {{ isFocusedOnChart ? currentChartValue : defaultChartData.value }}
        <div
          class="text-sm	font-medium text-gray-500"
          :class="{ 'text-pink-500': isFocusedOnChart }"
        >
          {{ isFocusedOnChart ? currentChartDate : defaultChartData.title }}
        </div>
      </div>
    </div>

    <BalChart
      height="96"
      :data="chartData.data"
      :axis-label-formatter="{
        yAxis: { style: 'currency', abbreviate: true, fractionDigits: 0 }
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
