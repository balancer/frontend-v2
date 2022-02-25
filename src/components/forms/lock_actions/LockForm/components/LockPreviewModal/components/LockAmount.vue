<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { FullPool } from '@/services/balancer/subgraph/types';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  totalLpTokens: string;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const poolWeightsLabel = computed(() =>
  props.lockablePool.tokens
    .map(token => {
      const weightLabel = formatWeightLabel(token.weight);
      const symbol = token.symbol ?? tokens.value[token.address].symbol;

      return `${weightLabel} ${symbol}`;
    })
    .join(' / ')
);

/**
 * METHODS
 */
function formatWeightLabel(weight: string) {
  return fNum2(weight, {
    style: 'percent',
    maximumFractionDigits: 0
  });
}
</script>

<template>
  <div class="container">
    <div class="p-3 flex justify-between items-center">
      <div>
        <div class="font-semibold">
          {{
            $t('getVeBAL.previewModal.lpTokens', [
              fNum2(totalLpTokens, FNumFormats.token)
            ])
          }}
        </div>
        <div class="text-gray-400 dark:text-gray-600">
          {{ poolWeightsLabel }}
        </div>
      </div>
      <div class="grid gap-1 grid-cols-2">
        <BalAsset
          v-for="tokenAddress in lockablePool.tokenAddresses"
          :key="tokenAddress"
          :address="tokenAddress"
          :size="30"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}
</style>
