<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useJoinPool } from '@/providers/local/join-pool.provider';

import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useAddLiquidityTotals } from '../composables/useAddLiquidityTotals';
import { useUserSettings } from '@/providers/user-settings.provider';

type Props = {
  pool: Pool;
};

const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { isWalletReady } = useWeb3();
const { slippage } = useUserSettings();

const {
  highPriceImpact,
  isLoadingQuery,
  priceImpact,
  supportsProportionalOptimization,
  fiatValueIn,
  bptOut,
} = useJoinPool();

const {
  priceImpactClasses,
  optimizeBtnClasses,
  hasBalanceForAllTokens,
  hasBalanceForSomeTokens,
  optimized,
  maximized,
  maximizeAmounts,
  optimizeAmounts,
} = useAddLiquidityTotals(props.pool);
</script>

<template>
  <div class="data-table">
    <div class="data-table-row total-row">
      <div class="p-2">
        {{ $t('total') }}
      </div>
      <div class="data-table-number-col">
        {{ fNum(fiatValueIn, FNumFormats.fiat) }}
        <div v-if="isWalletReady && hasBalanceForSomeTokens" class="text-sm">
          <span v-if="maximized" class="text-gray-400 dark:text-gray-600">
            {{ $t('maxed') }}
          </span>
          <span
            v-else
            class="text-blue-500 cursor-pointer"
            @click="maximizeAmounts"
          >
            {{ $t('max') }}
          </span>
        </div>
      </div>
    </div>
    <div :class="['data-table-row secondary-row']">
      <div class="p-2">LP tokens</div>
      <div class="data-table-number-col">
        <div class="flex">
          <span v-if="!isLoadingQuery">
            {{ fNum(bptOut, FNumFormats.token) }}
          </span>
          <BalLoadingBlock v-else class="w-10" />

          <BalTooltip
            :text="`LP tokens you are expected to receive, not
          including possible slippage (${fNum(slippage, FNumFormats.percent)})`"
          >
            <template #activator>
              <BalIcon
                name="info"
                size="xs"
                class="-mb-px ml-1 text-gray-400"
              />
            </template>
          </BalTooltip>
        </div>
      </div>
    </div>
    <div :class="['data-table-row secondary-row', priceImpactClasses]">
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
            isWalletReady &&
            hasBalanceForAllTokens &&
            supportsProportionalOptimization
          "
          class="text-sm font-semibold"
        >
          <span v-if="optimized" class="text-gray-400 dark:text-gray-600">
            {{ $t('optimized') }}
          </span>
          <span
            v-else
            :class="['cursor-pointer', optimizeBtnClasses]"
            @click="optimizeAmounts"
          >
            {{ $t('optimize') }}
          </span>
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

.secondary-row {
  @apply text-sm rounded-b-lg;
}
</style>
