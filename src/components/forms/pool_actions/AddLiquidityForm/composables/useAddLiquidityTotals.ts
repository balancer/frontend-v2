import { useJoinPool } from '@/providers/local/join-pool.provider';

import usePropMaxJoin from '@/composables/pools/usePropMaxJoin';
import { isWrappedNativeAsset } from '@/composables/usePoolHelpers';
import { bnum, isSameAddress } from '@/lib/utils';
import { useUserTokens } from '@/providers/local/user-tokens.provider';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';

export function useAddLiquidityTotals(pool: Pool) {
  /**
   * COMPOSABLES
   */
  const {
    poolJoinTokens,
    highPriceImpact,
    supportsProportionalOptimization,
    amountsIn,
    tokensIn,
    setAmountsIn,
  } = useJoinPool();

  const { isWethOrEth, nativeAsset, balanceFor } = useTokens();
  const { tokensWithBalanceFrom, tokensWithoutBalanceFrom } = useUserTokens();

  const useNativeAsset = computed((): boolean => {
    return amountsIn.value.some(amountIn =>
      isSameAddress(amountIn.address, nativeAsset.address)
    );
  });

  const { getPropMax } = usePropMaxJoin(pool, tokensIn, useNativeAsset);

  /**
   * COMPUTED
   */
  const priceImpactClasses = computed(() => ({
    'dark:bg-gray-800': !highPriceImpact.value,
    'bg-red-500 dark:bg-red-500 text-white divide-red-400':
      highPriceImpact.value,
  }));

  const optimizeBtnClasses = computed(() => ({
    'text-gradient': !highPriceImpact.value,
    'text-red-500 px-2 py-1 bg-white rounded-lg': highPriceImpact.value,
  }));

  const hasBalanceForAllTokens = computed((): boolean => {
    const hasBalanceForAll =
      tokensWithoutBalanceFrom(poolJoinTokens.value).filter(
        address => !isWethOrEth(address)
      ).length === 0;

    // If the pool contains the wrapped native asset, user might have balance for just one of them
    if (isWrappedNativeAsset(pool)) {
      const hasWethOrEthBalance = tokensWithBalanceFrom(
        poolJoinTokens.value
      ).some(address => isWethOrEth(address));
      return hasBalanceForAll && hasWethOrEthBalance;
    }
    return hasBalanceForAll;
  });

  const hasBalanceForSomeTokens = computed((): boolean => {
    const hasBalanceForSome =
      tokensWithBalanceFrom(poolJoinTokens.value).filter(
        address => !isWethOrEth(address)
      ).length > 0;

    // If the pool contains the wrapped native asset, user might have balance for just one of them
    if (isWrappedNativeAsset(pool)) {
      const hasWethOrEthBalance = tokensWithBalanceFrom(
        poolJoinTokens.value
      ).some(address => isWethOrEth(address));
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

  const optimized = computed((): boolean => {
    if (!supportsProportionalOptimization.value) return false;
    const propMaxAmountsIn = getPropMax();
    return amountsIn.value.every(
      (item, i) => Number(item.value) === Number(propMaxAmountsIn[i].value)
    );
  });

  /**
   * METHODS
   */
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

  return {
    priceImpactClasses,
    optimizeBtnClasses,
    hasBalanceForAllTokens,
    hasBalanceForSomeTokens,
    optimized,
    maximized,
    maximizeAmounts,
    optimizeAmounts,
  };
}
