<script setup lang="ts">
import { computed } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { includesAddress } from '@/lib/utils';
import { PoolToken } from '@/services/pool/types';

import HiddenTokensPills from './HiddenTokensPills.vue';
import StableTokenPill from './StableTokenPill.vue';
import WeightedTokenPill from './WeightedTokenPill.vue';

type Props = {
  tokens: PoolToken[];
  isStablePool?: boolean;
  selectedTokens?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  isStablePool: false,
  selectedTokens: () => [],
});

const { fNum2 } = useNumbers();
const { getToken, hasBalance } = useTokens();

/**
 * COMPUTED
 */
const visibleTokens = computed(() => props.tokens.slice(0, MAX_PILLS));

const hiddenTokens = computed(() => props.tokens.slice(MAX_PILLS));

const hasBalanceInHiddenTokens = computed(() =>
  hiddenTokens.value.some(token => hasBalance(token.address))
);

const isSelectedInHiddenTokens = computed(() =>
  hiddenTokens.value.some(token =>
    includesAddress(props.selectedTokens, token.address)
  )
);

/**
 * METHODS
 */
function symbolFor(token: PoolToken): string {
  return token.symbol || getToken(token.address)?.symbol || '---';
}

function weightFor(token: PoolToken): string {
  return fNum2(token.weight, {
    style: 'percent',
    maximumFractionDigits: 0,
  });
}

const MAX_PILLS = 11;
</script>

<template>
  <div class="flex flex-wrap gap-y-2 -mt-1">
    <template v-if="isStablePool">
      <StableTokenPill
        v-for="token in visibleTokens"
        :key="token.address"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :token="token"
        :isSelected="includesAddress(selectedTokens, token.address)"
      />
    </template>
    <template v-else>
      <WeightedTokenPill
        v-for="token in visibleTokens"
        :key="token.address"
        :hasBalance="hasBalance(token.address)"
        :symbol="symbolFor(token)"
        :weight="weightFor(token)"
        :token="token"
        :isSelected="includesAddress(selectedTokens, token.address)"
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
