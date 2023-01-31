<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useJoinPool from '@/composables/pools/useJoinPool';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';

const emit = defineEmits<{
  (e: 'optimize'): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const {
  highPriceImpact,
  isLoadingQuery,
  priceImpact,
  optimized,
  amountsIn,
  supportsPropotionalOptimization,
} = useJoinPool();
const { isWalletReady } = useWeb3();
const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'dark:bg-gray-800': !highPriceImpact.value,
  'bg-red-500 dark:bg-red-500 text-white divide-red-400': highPriceImpact.value,
}));

const optimizeBtnClasses = computed(() => ({
  'text-gradient': !highPriceImpact.value,
  'text-red-500 px-2 py-1 bg-white rounded-lg': highPriceImpact.value,
}));

const hasAllTokens = computed((): boolean => {
  const balances = amountsIn.value.map(token => balanceFor(token.address));
  const hasBalanceForAllTokens = balances.every(balance => bnum(balance).gt(0));
  return hasBalanceForAllTokens;
});
</script>

<template>
  <div class="data-table">
    <div :class="['data-table-row price-impact-row', priceImpactClasses]">
      <div class="p-2">
        {{ $t('priceImpact') }}
      </div>
      <div class="data-table-number-col">
        <div class="flex">
          <span v-if="!isLoadingQuery">
            {{ fNum(priceImpact, FNumFormats.percent) }}
          </span>
          <BalLoadingBlock v-else class="w-10" />

          <BalTooltip :text="$t('customAmountsTip')">
            <template #activator>
              <BalIcon
                v-if="highPriceImpact"
                name="alert-triangle"
                size="xs"
                class="-mb-px ml-1"
              />
              <BalIcon
                v-else
                name="info"
                size="xs"
                class="-mb-px ml-1 text-gray-400"
              />
            </template>
          </BalTooltip>
        </div>
        <div
          v-if="
            isWalletReady && hasAllTokens && supportsPropotionalOptimization
          "
          class="text-sm font-semibold"
        >
          <span v-if="optimized" class="text-gray-400 dark:text-gray-600">
            {{ $t('optimized') }}
          </span>
          <button
            v-else
            :class="['cursor-pointer', optimizeBtnClasses]"
            @click="emit('optimize')"
          >
            {{ $t('optimize') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  @apply border dark:border-gray-900 rounded-lg divide-y dark:divide-gray-900;
}

.data-table-row {
  @apply grid grid-cols-4 items-center;
  @apply divide-x dark:divide-gray-900;
}

.data-table-row:first-child {
  @apply rounded-t-lg;
}

.data-table-number-col {
  @apply col-span-3 p-2 flex items-center justify-between;
}

.total-row {
  @apply text-lg font-bold dark:bg-gray-800;
}

.price-impact-row {
  @apply text-sm rounded-b-lg;
}
</style>
