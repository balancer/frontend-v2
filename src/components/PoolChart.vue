<template>
  <div class="chart mr-n2 ml-n2" v-if="nonEmptyHistory.length >= 7">
    <apexchart
      width="100%"
      height="400"
      type="line"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';

import useNumbers from '@/composables/useNumbers';
import { PoolSnapshots } from '@/api/subgraph';
import { useI18n } from 'vue-i18n';

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
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { t } = useI18n();

    const { prices, snapshots } = toRefs(props);

    function formatYAxis(value: number) {
      return fNum(value, null, '0.%');
    }

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

    const nonEmptyHistory = computed(() =>
      history.value.filter(state => state.totalShares !== '0')
    );

    const timestamps = computed(() => {
      return nonEmptyHistory.value.map(state => state.timestamp);
    });

    const holdValues = computed(() => {
      if (nonEmptyHistory.value.length === 0) {
        return [];
      }
      const firstState = nonEmptyHistory.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const values = history.value
        .filter(state => state.totalShares !== '0')
        .map(state => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(firstState.amounts, state.price);
          return currentValue / firstValue - 1;
        });
      return values;
    });

    const bptValues = computed(() => {
      if (nonEmptyHistory.value.length === 0) {
        return [];
      }
      const firstState = nonEmptyHistory.value[0];
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
          return currentValuePerBpt / firstValuePerBpt - 1;
        });
      return values;
    });

    const series = computed(() => [
      {
        name: t('poolReturns'),
        data: bptValues.value
      },
      {
        name: 'HODL',
        data: holdValues.value
      }
    ]);

    const options = computed(() => {
      const minValue = Math.min(...holdValues.value, ...bptValues.value);
      const maxValue = Math.max(...holdValues.value, ...bptValues.value);
      const min = Math.floor(minValue * 4) / 4;
      const max = Math.ceil(maxValue * 4) / 4;
      const tickAmount = (max - min) * 4;
      return {
        chart: {
          type: 'line',
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: ['#28BD9C', '#333333'],
        stroke: {
          curve: 'straight',
          width: 2
        },
        grid: {
          borderColor: '#dfdde1',
          strokeDashArray: [4, 2]
        },
        xaxis: {
          type: 'datetime',
          tooltip: {
            enabled: false
          },
          categories: timestamps.value
        },
        yaxis: {
          min,
          max,
          tickAmount,
          opposite: true,
          labels: {
            formatter: formatYAxis
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetY: 8,
          markers: {
            width: 16,
            height: 4,
            radius: 2
          }
        }
      };
    });

    return {
      series,
      options,
      history,

      nonEmptyHistory,
      timestamps,
      holdValues,
      bptValues
    };
  }
});
</script>
