<template>
  <div class="-mt-1 flex flex-wrap">
    <template v-if="isStablePool">
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg flex">
        <StableTokenPill
          v-for="(token, i) in visibleTokens"
          :key="token"
          :hasBalance="hasBalance(token.address)"
          :symbol="symbolFor(token)"
          :isLast="visibleTokens.length - 1 === i"
        />
      </div>
    </template>
    <template v-else>
      <WeightedTokenPill
        v-for="token in visibleTokens"
        :key="token.address"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :weight="weightFor(token)"
      />
    </template>
    <HiddenTokensPills
      v-if="hiddenTokens.length > 0"
      :tokens="hiddenTokens"
      :hasBalance="hasBalanceInHiddenTokens"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { PoolToken } from '@/services/balancer/subgraph/types';

import WeightedTokenPill from './WeightedTokenPill.vue';
import StableTokenPill from './StableTokenPill.vue';
import HiddenTokensPills from './HiddenTokensPills.vue';

const MAX_PILLS = 11;

export default defineComponent({
  name: 'TokenPills',

  components: {
    WeightedTokenPill,
    StableTokenPill,
    HiddenTokensPills
  },

  props: {
    tokens: {
      type: Array as PropType<PoolToken[]>,
      required: true
    },
    isStablePool: { type: Boolean, required: true }
  },

  setup(props) {
    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();
    const { tokens, hasBalance } = useTokens();

    /**
     * COMPUTED
     */
    const visibleTokens = computed(() => props.tokens.slice(0, MAX_PILLS));

    const hiddenTokens = computed(() => props.tokens.slice(MAX_PILLS));

    const hasBalanceInHiddenTokens = computed(() =>
      hiddenTokens.value.some(token => hasBalance(token.address))
    );

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
      // computed
      visibleTokens,
      hiddenTokens,
      hasBalanceInHiddenTokens,

      // methods
      symbolFor,
      weightFor,
      hasBalance
    };
  }
});
</script>
