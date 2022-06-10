<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import BalBarChart from '@/components/_global/BalBarChart/BalBarChart.vue';
import BalLineChartNew from '@/components/_global/BalLineChart/BalLineChartNew.vue';
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
const periodOptions = [
  { text: '90 days', value: '90' },
  { text: '180 days', value: '180' },
  { text: '365 days', value: '365' },
  { text: 'All time', value: '399' }
];
const currentPeriod = ref(periodOptions[0].value);

function setCurrentPeriod(period: string) {
  currentPeriod.value = period;
}
const timestamps = computed(() =>
  history.value
    .map(state => format(state.timestamp, 'yy/MM/dd'))
    .slice(-currentPeriod.value)
);
const volumeData = computed(() => {
  const snapshotValues = Object.values(props.snapshots);
  const values = snapshotValues.reverse();

  return values
    .map((snapshot, idx) => {
      const prevValue = idx === 0 ? 0 : parseFloat(values[idx - 1].swapVolume);
      const value = parseFloat(snapshot.swapVolume);

      return { x: 10, y: value - prevValue > 0 ? value - prevValue : 0 };
    })
    .slice(-currentPeriod.value);
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
      backgroundColor: '#2563EB',
      borderColor: '#2563EB',
      data: Object.values(props.snapshots)
        .reverse()
        .map(snapshot => snapshot.liquidity)
    };
  }
  if (activeTab.value === PoolChartTab.FEES) {
    return {
      borderRadius: 100,
      backgroundColor: '#34D399',
      data: feesData.value
    };
  }

  return {
    borderRadius: 100,
    backgroundColor: '#34D399',
    data: volumeData.value
  };
});

/**
 * METHODS
 */

function showTooltip(context: any) {
  return fNum2(context.parsed.y, FNumFormats.fiat);
}

const plugins = {
  legend: {
    display: false
  },
  tooltip: {
    callbacks: {
      label: showTooltip
    }
  },
  title: {
    display: true,
    text: ctx => {
      const { axis = 'xy', intersect, mode } = ctx.chart.options.interaction;
      return 'Mode: ' + mode + ', axis: ' + axis + ', intersect: ' + intersect;
    }
  }
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  hover: {
    intersect: false
  },
  interaction: {
    intersect: false,
  },
  elements: {
    point: {
      radius: 0
    }
  },
  scales: {
    y: {
      beginAtZero: false,
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
        display: false,
        drawTicks: false,
        drawOnChartArea: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'interpolate',
      intersect: false,
      callbacks: {
        label: showTooltip
      }
    },
    crosshair: {
      line: {
        color: '#2563EB',
        width: 1
      },
      sync: {
        enabled: true
      },
      snap: {
        enabled: true
      },
      zoom: {
        enabled: true // enable zooming
      }
    }
  }
};

const barChartOptions = {
  responsive: true,
  elements: {
    point: {
      radius: 0
    }
  },
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
      // type: 'time',
      // time: {
      //   displayFormats: {
      //     millisecond: 'MMM dd',
      //     second: 'MMM dd',
      //     minute: 'MMM dd',
      //     hour: 'MMM dd',
      //     day: 'MMM dd',
      //     week: 'MMM dd',
      //     month: 'MMM dd',
      //     quarter: 'MMM dd',
      //     year: 'MMM dd'
      //   }
      // }
    },
    interaction: {
      intersect: true,
      mode: 'index'
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
};
</script>

<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else-if="history.length >= MIN_CHART_VALUES">
    <div class="px-4 sm:px-0 flex justify-between dark:border-gray-900 mb-6">
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
      <div class="w-24">
        <BalSelectInput
          :options="periodOptions"
          :model-value="currentPeriod"
          @change="setCurrentPeriod"
          name="periods"
        />
      </div>
    </div>
    <BalLineChartNew
      v-if="activeTab === PoolChartTab.TVL"
      :data="{
        labels: timestamps,
        datasets: [chartData]
      }"
      :chart-options="lineChartOptions"
      :styles="chartColors"
      chart-id="1"
      :height="226"
    />
    <BalBarChart
      v-else
      :data="{
        labels: timestamps,
        datasets: [chartData]
      }"
      :chart-options="barChartOptions"
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
