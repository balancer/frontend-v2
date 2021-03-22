<template>
  <BalCard v-if="actions.length > 0" :title="'Activity'">
    <div class="overflow-x-auto whitespace-nowrap text-base border rounded-lg">
      <table class="min-w-full text-black bg-white dark:bg-gray-900">
        <tr class="bg-gray-50 dark:bg-gray-700">
          <th class="sticky top-0 p-2 pl-5 py-5 text-left">Action</th>
          <th class="sticky top-0 p-2 py-5 text-right">Value</th>
          <th class="sticky top-0 p-2 py-5 text-right">Details</th>
          <th class="sticky top-0 p-2 pr-5 py-5 text-right">Date</th>
        </tr>
        <tr
          class="row hover:bg-gray-50"
          v-for="action in actions"
          :key="action.tx"
        >
          <td class="p-2 pl-5 py-5 text-left">
            {{ action.label }}
          </td>
          <td class="p-2 py-5 text-right">
            {{ _num(action.value, '$0,0.00') }}
          </td>
          <td class="p-2 py-5 text-right">
            {{ action.details }}
          </td>
          <td class="p-2 pr-5 py-5 text-right">
            <a
              :href="_explorer(web3.config.key, action.tx, 'tx')"
              target="_blank"
            >
              {{ formatDate(action.timestamp) }}
            </a>
          </td>
        </tr>
      </table>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { useStore } from 'vuex';

import useNumbers from '@/composables/useNumbers';
import { PoolSwap, PoolJoin, PoolExit, PoolEvents } from '@/api/subgraph';

interface Action {
  label: string;
  value: number;
  details: string;
  timestamp: number;
  tx: string;
}

export default {
  props: {
    tokens: {
      type: Object as PropType<string[]>,
      required: true
    },
    events: {
      type: Object as PropType<PoolEvents>,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const { format: formatNum } = useNumbers();

    const allTokens = computed(() => store.getters.getTokens());

    const actions = computed<Action[]>(() => {
      if (!Object.keys(props.events)) {
        return [];
      }
      const swapActions = props.events.swaps.map(swap => {
        return {
          label: 'Swap',
          value: getSwapValue(swap),
          details: getSwapDetails(swap),
          timestamp: swap.timestamp,
          tx: swap.tx
        };
      });
      const joinActions = props.events.joins.map(join => {
        return {
          label: 'Investment',
          value: getJoinExitValue(join),
          details: getJoinExitDetails(join),
          timestamp: join.timestamp,
          tx: join.tx
        };
      });
      const exitActions = props.events.exits.map(exit => {
        return {
          label: 'Withdrawal',
          value: getJoinExitValue(exit),
          details: getJoinExitDetails(exit),
          timestamp: exit.timestamp,
          tx: exit.tx
        };
      });
      const actions = [...swapActions, ...joinActions, ...exitActions];
      actions.sort((a, b) => b.timestamp - a.timestamp);
      return actions;
    });

    function formatDate(timestamp: number) {
      const date = new Date(timestamp * 1000);
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long'
      };
      return date.toLocaleString('en-US', dateOptions);
    }

    function getSwapValue(event: PoolSwap) {
      const tokenInPrice = store.state.market.prices[event.tokenIn];
      const tokenOutPrice = store.state.market.prices[event.tokenOut];
      if (tokenInPrice) {
        const tokenInAmount = parseFloat(event.tokenAmountIn);
        return tokenInPrice.price * tokenInAmount;
      }
      if (tokenOutPrice) {
        const tokenOutAmount = parseFloat(event.tokenAmountOut);
        return tokenOutPrice.price * tokenOutAmount;
      }
      return 0;
    }

    function getSwapDetails(event: PoolSwap) {
      const amountIn = parseFloat(event.tokenAmountIn);
      const amountOut = parseFloat(event.tokenAmountOut);
      const inLabel = `${formatNum(amountIn, '0.0000')} ${event.tokenInSym}`;
      const outLabel = `${formatNum(amountOut, '0.0000')} ${event.tokenOutSym}`;
      return `+${inLabel}, -${outLabel}`;
    }

    function getJoinExitValue(event: PoolJoin | PoolExit) {
      const value = event.amounts.reduce((total, amount, index) => {
        const address = props.tokens[index];
        const token = allTokens.value[address];
        const price = token.price || 0;
        const amountNumber = parseFloat(amount);
        return total + amountNumber * price;
      }, 0);
      return value;
    }

    function getJoinExitDetails(event: PoolJoin | PoolExit) {
      const tokenLabels = event.amounts
        .map((amount, index) => {
          const address = props.tokens[index];
          const token = allTokens.value[address];
          const symbol = token ? token.symbol : address;
          const amountNumber = parseFloat(amount);
          return `${amountNumber.toFixed(2)} ${symbol}`;
        })
        .join(' ');
      return tokenLabels;
    }

    return {
      actions,

      formatDate
    };
  }
};
</script>
