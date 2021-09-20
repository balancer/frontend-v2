<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { PoolToken } from '@/services/balancer/subgraph/types';

import WeightedTokenPill from './WeightedTokenPill.vue';
import StableTokenPill from './StableTokenPill.vue';
import HiddenTokensPills from './HiddenTokensPills.vue';

type Props = {
  tokens: PoolToken[];
  isStablePool: boolean;
  selectedTokens?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  selectedTokens: () => []
});

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

const isSelectedInHiddenTokens = computed(() =>
  hiddenTokens.value.some(token => props.selectedTokens.includes(token.address))
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

const MAX_PILLS = 11;
</script>

<template>
  <div class="-mt-1 flex flex-wrap">
    <template v-if="isStablePool">
      <StableTokenPill
        v-for="token in visibleTokens"
        :key="token"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :isSelected="selectedTokens.includes(token.address)"
      />
    </template>
    <template v-else>
      <WeightedTokenPill
        v-for="token in visibleTokens"
        :key="token.address"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :weight="weightFor(token)"
        :isSelected="selectedTokens.includes(token.address)"
      />
      <HiddenTokensPills
        v-if="hiddenTokens.length > 0"
        :tokens="hiddenTokens"
        :hasBalance="hasBalanceInHiddenTokens"
        :isSelected="isSelectedInHiddenTokens"
      />
    </template>
  </div>
</template>
