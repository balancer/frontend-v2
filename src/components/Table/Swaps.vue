<template>
  <div class="overflow-x-auto whitespace-nowrap text-base border rounded-lg">
    <table class="min-w-full text-black bg-white dark:bg-gray-900">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th class="sticky top-0 p-2 pl-5 py-5 text-left">Action</th>
        <th class="sticky top-0 p-2 py-5 text-right">Value</th>
        <th class="sticky top-0 p-2 py-5 text-right">Details</th>
        <th class="sticky top-0 p-2 pr-5 py-5 text-right">Date</th>
      </tr>
      <tr class="row hover:bg-gray-50" v-for="swap in swaps" :key="swap.tx">
        <td class="p-2 pl-5 py-5 text-left">
          Swap
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(getValue(swap), '$0,0.00') }}
        </td>
        <td class="p-2 py-5 text-right">
          +{{ _num(swap.tokenAmountIn, '0.0000') }} {{ swap.tokenInSym }}, -{{
            _num(swap.tokenAmountOut, '0.0000')
          }}
          {{ swap.tokenOutSym }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          <a :href="_explorer(web3.config.key, swap.tx, 'tx')" target="_blank">
            {{ getDate(swap.timestamp) }}
          </a>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { getAddress } from '@ethersproject/address';
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
        month: 'long'
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

    return {
      getDate,
      getValue
    };
  }
};
</script>
