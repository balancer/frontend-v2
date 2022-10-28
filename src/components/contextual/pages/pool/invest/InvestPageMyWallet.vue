<script setup lang="ts">
import { computed } from 'vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { isSameAddress, indexOfAddress } from '@/lib/utils';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import useTokens from '@/composables/useTokens';
import useJoinPool from '@/composables/pools/useJoinPool';

type Props = {
  poolSupportsGeneralisedJoin: boolean;
};

const props = withDefaults(defineProps<Props>(), {});

/**
 * COMPOSABLES
 */
const { pool, loadingPool, transfersAllowed, useNativeAsset } =
  usePoolTransfers();

const { isWethPool } = usePool(pool);
const { tokenAddresses, amounts } = useInvestState();
const { addTokensIn, setAmountsIn, isSingleAssetJoin, amountsIn } =
  useJoinPool();
const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();

/**
 * COMPUTED
 */
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});

/**
 * METHODS
 */
function handleMyWalletTokenClick(tokenAddress: string) {
  const maxBalance = getMaxBalanceFor(tokenAddress);

  if (props.poolSupportsGeneralisedJoin && isSingleAssetJoin.value) {
    // TODO: Swap the tab to single asset join

    // Set the new Token address
    setAmountsIn([]);
    addTokensIn([tokenAddress]);
    // Set the input value to max token balance
    amountsIn.value[0].value = maxBalance;
  } else if (isWethPool.value) {
    const isNativeAsset = isSameAddress(tokenAddress, nativeAsset.address);
    const isWrappedNativeAsset = isSameAddress(
      tokenAddress,
      wrappedNativeAsset.value?.address
    );
    if (isNativeAsset || isWrappedNativeAsset) {
      // Swap input token between Native and Wrapped Native assets
      useNativeAsset.value = isNativeAsset;
    }

    // SetTimeout hack.
    // Race condition when switching between 'native'/'wrapped native' assets,
    // and then setting the new input value
    setTimeout(() => {
      // Set the input value to max token balance for lecacy invest state
      const indexOfAsset = indexOfAddress(tokenAddresses.value, tokenAddress);

      if (indexOfAsset >= 0) {
        amounts.value[indexOfAsset] = maxBalance;
      }
    }, 50);
  }
}
</script>

<template>
  <BalLoadingBlock
    v-if="loadingPool || !pool || !transfersAllowed"
    class="h-64"
  />
  <MyWallet
    v-else
    includeNativeAsset
    :excludedTokens="excludedTokens"
    :pool="pool"
    @click:asset="handleMyWalletTokenClick"
  />
</template>


