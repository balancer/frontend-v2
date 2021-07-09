<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else-if="nonEmptySnapshots.length >= 7">
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

<script lang="ts">
import { PropType, defineComponent, toRefs, computed, Ref } from 'vue';

import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import { fromUnixTime, format } from 'date-fns';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import useTailwind from '@/composables/useTailwind';
import useDarkMode from '@/composables/useDarkMode';

interface HistoryItem {
  timestamp: number;
  price: number[];
  amounts: string[];
  totalShares: string;
}

export default defineComponent({
  name: 'PoolChart',

  props: {
    prices: {
      type: Object as PropType<Record<string, number[]>>,
      required: true
    },
    snapshots: {
      type: Object as PropType<PoolSnapshots>,
      required: true
    },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    const store = useStore();
    const { t } = useI18n();

    const {
      prices,
      snapshots
    }: {
      prices: Ref<Record<string, number[]>>;
      snapshots: Ref<PoolSnapshots>;
    } = toRefs(props);

    const appLoading = computed(() => store.state.app.loading);
    const tailwind = useTailwind();
    const { darkMode } = useDarkMode();

    const hodlColor = computed(() =>
      darkMode.value
        ? tailwind.theme.colors.gray['600']
        : tailwind.theme.colors.black
    );

    const chartColors = [tailwind.theme.colors.green['400'], hodlColor.value];

    const nonEmptySnapshots = computed(() => {
      if (!history.value || !history.value) return [];
      return history.value.filter((state: any) => state.totalShares !== '0');
    });

    function getPoolValue(amounts: string[], prices: number[]) {
      const values = amounts.map((amount, index) => {
        const price = prices[index];
        return price * parseFloat(amount);
      });
      return values.reduce((total, value) => total + value, 0);
    }

    const history = computed(() => {
      if (!prices || !prices.value || Object.values(prices.value).length === 0)
        return [];
      if (!snapshots || !snapshots.value) return [];

      const defaultState = {
        amounts: ['0', '0'],
        totalShares: '0'
      };

      const history = Object.keys(prices.value).map(timestamp => {
        if (!prices.value || !snapshots.value) return [];
        const price = prices.value[timestamp];
        const state = snapshots.value[timestamp]
          ? snapshots.value[timestamp]
          : defaultState;

        const amounts: string[] = state.amounts;
        const totalShares: string = state.totalShares;
        return {
          timestamp: parseInt(timestamp),
          price,
          amounts,
          totalShares
        };
      });
      return history;
    });

    const timestamps = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0)
        return [];
      return nonEmptySnapshots.value.map((state: any) =>
        format(fromUnixTime(state.timestamp / 1000), 'yyyy/MM/dd')
      );
    });

    const holdValues = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState: any = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const values = history.value
        .filter((state: any) => state.totalShares !== '0')
        .map((state: any) => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(firstState.amounts, state.price);
          return currentValue / firstValue - 1;
        });
      return values;
    });

    const bptValues = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState: any = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const firstShares = parseFloat(firstState.totalShares);
      const firstValuePerBpt = firstValue / firstShares;
      const values = history.value
        .filter((state: any) => state.totalShares !== '0')
        .map((state: any) => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(state.amounts, state.price);
          const currentShares = parseFloat(state.totalShares);
          const currentValuePerBpt = currentValue / currentShares;
          return currentValuePerBpt / firstValuePerBpt - 1;
        });
      return values;
    });

    const series = computed(() => [
      {
        name: t('poolReturns'),
        values: zip(timestamps.value, bptValues.value)
      },
      {
        name: 'HODL',
        values: zip(timestamps.value, holdValues.value)
      }
    ]);

    return {
      series,
      appLoading,
      nonEmptySnapshots,
      chartColors
    };
  }
});
</script>
