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
import { defineComponent, toRefs, computed } from 'vue';

import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  props: {
    tokens: Object,
    prices: Object,
    snapshots: Object
  },
  setup(props) {
    const { format: formatNum } = useNumbers();

    const { tokens, prices, snapshots } = toRefs(props);

    function formatYAxis(value) {
      return formatNum(value, '0.%');
    }

    function getAssetValue(state) {
      const values = state.amounts.map((amount, index) => {
        const price = state.price[index];
        return price * amount;
      });
      return values.reduce((total, value) => total + value, 0);
    }

    const history = computed(() => {
      if (!tokens || !tokens.value) {
        return [];
      }
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
        amounts: tokens.value.map(() => '0'),
        totalShares: '0'
      };
      const history = Object.keys(prices.value).map(timestamp => {
        const price = prices.value[timestamp];
        const state = snapshots.value[timestamp] || poolState;
        const { amounts, totalShares } = state;
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
      const values = history.value
        .filter(state => state.totalShares !== '0')
        .map(state => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const firstValue = getAssetValue(firstState);
          const currentValue = getAssetValue(state);
          return currentValue / firstValue - 1;
        });
      return values;
    });

    const bptValues = computed(() => {
      if (nonEmptyHistory.value.length === 0) {
        return [];
      }
      const firstState = nonEmptyHistory.value[0];
      const values = history.value
        .filter(state => state.totalShares !== '0')
        .map(state => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const firstShares = firstState.totalShares;
          const currentShares = state.totalShares;
          const amounts = state.amounts.map(amount => {
            const amountNumber = parseFloat(amount);
            const firstSharesNumber = parseFloat(firstShares);
            const currentSharesNumber = parseFloat(currentShares);
            return (amountNumber * firstSharesNumber) / currentSharesNumber;
          });
          const updatedState = {
            amounts,
            price: state.price
          };
          const firstValue = getAssetValue(firstState);
          const currentValue = getAssetValue(updatedState);
          return currentValue / firstValue - 1;
        });
      return values;
    });

    const series = computed(() => [
      {
        name: 'Pool returns',
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
        colors: ['#8A00FF', '#333333'],
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
          horizontalAlign: 'left',
          offsetY: 8
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
