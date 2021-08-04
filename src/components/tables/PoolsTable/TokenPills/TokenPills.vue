<template>
  <div class="-mt-1 flex flex-wrap">
    <template v-if="isStablePool">
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg flex">
        <StableTokenPill
          v-for="(token, i) in tokens"
          :key="token"
          :hasBalance="hasBalance(token.address)"
          :symbol="symbolFor(token)"
          :isLast="tokens.length - 1 === i"
        />
      </div>
    </template>
    <template v-else>
      <WeightedTokenPill
        v-for="token in tokens"
        :key="token.address"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :weight="weightFor(token)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import useNumbers from '@/composables/useNumbers';
import { PoolToken } from '@/services/balancer/subgraph/types';
import { defineComponent, PropType } from 'vue';
import useTokens from '@/composables/useTokens';
import WeightedTokenPill from './WeightedTokenPill.vue';
import StableTokenPill from './StableTokenPill.vue';

export default defineComponent({
  name: 'TokenPills',

  components: {
    WeightedTokenPill,
    StableTokenPill
  },

  props: {
    tokens: {
      type: Array as PropType<PoolToken[]>,
      required: true
    },
    isStablePool: { type: Boolean, required: true }
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();
    const { tokens, hasBalance } = useTokens();

    /**
     * METHODS
     */
    function symbolFor(token: PoolToken): string {
      return tokens.value[token.address]?.symbol || '---';
    }

    function weightFor(token: PoolToken): string {
      return fNum(token.weight, 'percent_lg');
    }

    return {
      // methods
      symbolFor,
      weightFor,
      hasBalance
    };
  }
});
</script>
