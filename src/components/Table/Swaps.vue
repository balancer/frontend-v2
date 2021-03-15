<template>
  <div class="overflow-x-auto whitespace-nowrap text-base">
    <table class="min-w-full text-black bg-white dark:bg-gray-900">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th class="sticky top-0 p-2 pl-4 py-6 text-left">Time</th>
        <th class="sticky top-0 p-2 py-6 text-right">In</th>
        <th class="sticky top-0 p-2 py-6 text-right">Out</th>
        <th class="sticky top-0 p-2 py-6 text-right">Value</th>
        <th class="sticky top-0 p-2 py-6 text-right">Fee</th>
        <th class="sticky top-0 p-2 pr-4 py-6 text-right">Transaction</th>
      </tr>
      <tr class="row hover:bg-gray-50" v-for="swap in swaps" :key="swap.id">
        <th class="sticky top-0 p-2 pl-4 py-6 text-left">
          {{ getDate(swap.timestamp) }}
        </th>
        <th class="sticky top-0 p-2 py-6 text-right">
          {{ _num(swap.tokenAmountIn, '0.0000') }} {{ swap.tokenInSym }}
        </th>
        <th class="sticky top-0 p-2 py-6 text-right">
          {{ _num(swap.tokenAmountOut, '0.0000') }} {{ swap.tokenOutSym }}
        </th>
        <th class="sticky top-0 p-2 py-6 text-right">
          {{ _num(getValue(swap), '$0,0.00') }}
        </th>
        <th class="sticky top-0 p-2 py-6 text-right">
          {{ _num(getFeeValue(swap), '$0,0.00') }}
        </th>
        <th class="sticky top-0 p-2 pr-4 py-6 text-right">
          <a :href="_explorer(web3.config.key, swap.id, 'tx')" target="_blank">
            {{ swap.id.substr(0, 10) }}…
          </a>
        </th>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { useStore } from 'vuex';

export default {
  props: {
    swaps: Object
  },
  setup() {
    const store = useStore();

    function getDate(timestamp) {
      const timestampNumber = parseInt(timestamp);
      const date = new Date(timestampNumber * 1000);
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleString('en-US', dateOptions);
    }

    function getValue(swap) {
      const tokenInPrice = store.state.market.prices[getAddress(swap.tokenIn)];
      const tokenOutPrice =
        store.state.market.prices[getAddress(swap.tokenOut)];
      if (tokenInPrice) {
        const tokenInAmount = parseFloat(swap.tokenAmountIn);
        return tokenInPrice.price * tokenInAmount;
      }
      if (tokenOutPrice) {
        const tokenOutAmount = parseFloat(swap.tokenAmountOut);
        return tokenOutPrice.price * tokenOutAmount;
      }
      return 0;
    }

    function getFeeValue(swap) {
      const value = getValue(swap);
      const fee = parseFloat(formatUnits(swap.poolId.swapFee, 18));
      return fee * value;
    }

    return {
      getDate,
      getValue,
      getFeeValue
    };
  }
};
</script>

<style scoped>
table {
  color: var(--text-color);
}

.row:hover {
  background-color: var(--bg-color);
}
</style>
