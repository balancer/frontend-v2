<script setup lang="ts">
import { computed, nextTick } from 'vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { isSameAddress, indexOfAddress } from '@/lib/utils';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import { useTokens } from '@/providers/tokens.provider';
import useJoinPool from '@/composables/pools/useJoinPool';
import useInvestPageTabs, {
  Tab,
  tabs,
} from '@/composables/pools/useInvestPageTabs';

/**
 * COMPOSABLES
 */
const { pool, loadingPool, transfersAllowed, useNativeAsset } =
  usePoolTransfers();

const { isWethPool, isDeepPool } = usePool(pool);
const { tokenAddresses, amounts } = useInvestState();
const { setAmountsIn, isSingleAssetJoin, amountsIn } = useJoinPool();
const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();
const { activeTab } = useInvestPageTabs();

/**
 * COMPUTED
 */
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});

/**
 * METHODS
 */

function setMaxAmount(tokenAddress: string, maxBalance: string) {
  if (isSingleAssetJoin.value) {
    // Set the new Token address, and set the input value to max token balance
    setAmountsIn([
      {
        address: tokenAddress,
        value: maxBalance,
        valid: true,
      },
    ]);
  } else {
    const amountIn = amountsIn.value.find(item =>
      isSameAddress(tokenAddress, item.address)
    );
    if (amountIn) {
      amountIn.address = tokenAddress;
      amountIn.valid = true;
      amountIn.value = maxBalance;
    }
  }
}

// Set the input value to max token balance for lecacy invest state
function setMaxAmountForLegacyInvestState(
  tokenAddress: string,
  maxBalance: string
) {
  const indexOfAsset = indexOfAddress(tokenAddresses.value, tokenAddress);

  if (indexOfAsset >= 0) {
    amounts.value[indexOfAsset] = maxBalance;
  }
}

function handleMyWalletTokenClick(tokenAddress: string, isPoolToken: boolean) {
  const maxBalance = getMaxBalanceFor(tokenAddress);

  if (isDeepPool.value) {
    if (isPoolToken) {
      setMaxAmount(tokenAddress, maxBalance);
    } else {
      // If non pool token is clicked, switch to Single Token tab
      activeTab.value = tabs[Tab.SingleToken].value;
      // Wait for the tab to update, the set the max amount
      nextTick(() => {
        setMaxAmount(tokenAddress, maxBalance);
      });
    }
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
      setMaxAmountForLegacyInvestState(tokenAddress, maxBalance);
    }, 50);
  } else {
    setMaxAmountForLegacyInvestState(tokenAddress, maxBalance);
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


