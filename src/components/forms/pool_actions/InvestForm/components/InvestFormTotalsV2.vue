<script setup lang="ts">
import { computed } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useJoinPool } from '@/providers/local/join-pool.provider';

import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import useMyWalletTokens from '@/composables/useMyWalletTokens';
import { Pool } from '@/services/pool/types';
import { isWrappedNativeAsset } from '@/composables/usePoolHelpers';
import { bnum, isSameAddress } from '@/lib/utils';
import usePropMaxJoin from '@/composables/pools/usePropMaxJoin';

type Props = {
  pool: Pool;
};

const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const {
  highPriceImpact,
  isLoadingQuery,
  priceImpact,
  supportsProportionalOptimization,
  fiatValueIn,
  amountsIn,
  tokensIn,
  setAmountsIn,
} = useJoinPool();
const { isWalletReady } = useWeb3();
const { isWethOrEth, nativeAsset, balanceFor } = useTokens();
const { poolTokensWithoutBalance, poolTokensWithBalance } = useMyWalletTokens({
  pool: props.pool,
  excludedTokens: [props.pool.address],
});

const useNativeAsset = computed((): boolean => {
  return amountsIn.value.some(amountIn =>
    isSameAddress(amountIn.address, nativeAsset.address)
  );
});

const { getPropMax } = usePropMaxJoin(props.pool, tokensIn, useNativeAsset);

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

const hasBalanceForAllTokens = computed((): boolean => {
  const hasBalanceForAll =
    poolTokensWithoutBalance.value.filter(address => !isWethOrEth(address))
      .length === 0;

  // If the pool contains the wrapped native asset, user might have balance for just one of them
  if (isWrappedNativeAsset(props.pool)) {
    const hasWethOrEthBalance = poolTokensWithBalance.value.some(address =>
      isWethOrEth(address)
    );
    return hasBalanceForAll && hasWethOrEthBalance;
  }
  return hasBalanceForAll;
});

const hasBalanceForSomeTokens = computed((): boolean => {
  const hasBalanceForSome =
    poolTokensWithBalance.value.filter(address => !isWethOrEth(address))
      .length > 0;

  // If the pool contains the wrapped native asset, user might have balance for just one of them
  if (isWrappedNativeAsset(props.pool)) {
    const hasWethOrEthBalance = poolTokensWithBalance.value.some(address =>
      isWethOrEth(address)
    );
    return hasBalanceForSome || hasWethOrEthBalance;
  }
  return hasBalanceForSome;
});

const maximized = computed(() =>
  amountsIn.value.every(amount => {
    if (isSameAddress(amount.address, nativeAsset.address)) {
      const balance = balanceFor(amount.address);
      return (
        amount.value ===
        bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
      );
    } else {
      return amount.value === balanceFor(amount.address);
    }
  })
);

/**
 * METHODS
 */
const optimized = computed((): boolean => {
  if (!supportsProportionalOptimization.value) return false;
  const propMaxAmountsIn = getPropMax();
  return amountsIn.value.every(
    (item, i) => item.value === propMaxAmountsIn[i].value
  );
});

function maximizeAmounts(): void {
  amountsIn.value.forEach(amount => {
    if (isSameAddress(amount.address, nativeAsset.address)) {
      const balance = balanceFor(amount.address);
      amount.value = bnum(balance).gt(nativeAsset.minTransactionBuffer)
        ? bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
        : '0';
    } else {
      amount.value = balanceFor(amount.address);
    }
  });
}

function optimizeAmounts() {
  const propMaxAmountsIn = getPropMax();
  setAmountsIn(propMaxAmountsIn);
}
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

.price-impact-row {
  @apply text-sm rounded-b-lg;
}
</style>
