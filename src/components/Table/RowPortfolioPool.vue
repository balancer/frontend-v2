<template>
  <tr class="cursor-pointer hover:bg-gray-50">
    <td class="p-2 pl-4 py-6 flex">
      <div class="w-20 relative">
        <span
          v-for="(token, i) in pool.tokens"
          :key="token"
          class="hover:z-10 absolute"
          :style="{ left: `${getIconPosition(i, pool.tokens.length)}px` }"
        >
          <Token :token="tokens[token]" />
        </span>
      </div>
      <div>
        <span class="ml-2" v-for="(token, i) in pool.tokens" :key="token">
          {{ _num(pool.strategy.weightsPercent[i]) }}
          {{ tokens[token].symbol }}
        </span>
      </div>
    </td>
    <td class="p-2 py-6 text-right">
      {{ _num(sharesValue, '$0,0.00') }}
    </td>
    <td class="p-2 py-6 text-right">
      {{ _num(pool.liquidity, '$0,0') }}
    </td>
    <td class="p-2 py-6 text-right">
      {{ _num(pool.volume, '$0,0') }}
    </td>
    <td class="p-2 pr-4 py-6 text-right">
      {{ _num(pool.apy, '0,0%') }}
    </td>
  </tr>
</template>

<script>
import { formatUnits } from '@ethersproject/units';

export default {
  props: {
    pool: Object,
    tokens: Object,
    withShares: Boolean
  },
  computed: {
    sharesValue() {
      if (!this.pool.shares) return 0;
      return (
        (this.pool.liquidity / formatUnits(this.pool.totalSupply, 18)) *
        this.pool.shares
      );
    }
  },
  methods: {
    getIconPosition(i, count) {
      if (count < 3) return 28 * i;
      if (count === 3) return 24 * i;
      return (48 * i) / (count - 1);
    }
  }
};
</script>
