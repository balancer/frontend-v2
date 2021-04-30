<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-60" />
  <div class="chart mr-n2 ml-n2" v-else-if="nonEmptySnapshots.length >= 7">
    <BalLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :showAxis="true"
      :axisLabelFormatter="{ yAxis: '0.00%' }"
      :color="chartColors"
      height="96"
      :showLegend="true"
    />
  </div>
  <BalBlankSlate v-else class="h-60">
    <BalIcon name="bar-chart" />
    {{ $t('insufficientData') }}
  </BalBlankSlate>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';

import { PoolSnapshots } from '@/api/subgraph';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import { fromUnixTime, format } from 'date-fns';
import useTailwind from '@/composables/useTailwind';

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

    const { prices, snapshots } = toRefs(props);

    const appLoading = computed(() => store.state.app.loading);
    const tailwind = useTailwind();
    const chartColors = [
      tailwind.theme.colors.green['400'],
      tailwind.theme.colors.black
    ];

    const nonEmptySnapshots = computed(() =>
      history.value.filter(state => state.totalShares !== '0')
    );

    function getPoolValue(amounts: string[], prices: number[]) {
      const values = amounts.map((amount, index) => {
        const price = prices[index];
        return price * parseFloat(amount);
      });
      return values.reduce((total, value) => total + value, 0);
    }

    const history = computed(() => {
      if (!prices || !prices.value) {
        return [];
      }
      if (!snapshots || !snapshots.value) {
        return [];
      }
      const timestamps = Object.keys(prices.value);
      if (timestamps.length === 0) {
        return [];
      }
      let poolState = {
        amounts: ['0', '0'],
        totalShares: '0'
      };
      const history = Object.keys(prices.value).map(timestamp => {
        const price = prices.value[timestamp];
        const state = snapshots.value[timestamp] || poolState;
        const amounts = state.amounts as string[];
        const totalShares = state.totalShares as string;
        poolState = {
          amounts,
          totalShares
        };
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
      return nonEmptySnapshots.value.map(state =>
        format(fromUnixTime(state.timestamp / 1000), 'yyyy/MM/dd')
      );
    });

    const holdValues = computed(() => {
      if (nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const values = history.value
        .filter(state => state.totalShares !== '0')
        .map(state => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(firstState.amounts, state.price);
          return (currentValue / firstValue - 1) / 100;
        });
      return values;
    });

    const bptValues = computed(() => {
      if (nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const firstShares = parseFloat(firstState.totalShares);
      const firstValuePerBpt = firstValue / firstShares;
      const values = history.value
        .filter(state => state.totalShares !== '0')
        .map(state => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(state.amounts, state.price);
          const currentShares = parseFloat(state.totalShares);
          const currentValuePerBpt = currentValue / currentShares;
          return (currentValuePerBpt / firstValuePerBpt - 1) / 100;
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
