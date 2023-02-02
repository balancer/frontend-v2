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
import {
  getSupportsJoinPoolProvider,
  AmountIn,
} from '@/providers/local/join-pool.provider';

/**
 * COMPOSABLES
 */
const { pool, loadingPool, transfersAllowed, useNativeAsset } =
  usePoolTransfers();

const { isWethPool } = usePool(pool);
const { tokenAddresses, amounts } = useInvestState();
const { setAmountsIn, setJoinWithNativeAsset, isSingleAssetJoin, amountsIn } =
  useJoinPool();
const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();
const { activeTab } = useInvestPageTabs();

/**
 * COMPUTED
 */
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});

const supportsJoinPoolProvider = computed(() =>
  getSupportsJoinPoolProvider(pool.value)
);

/**
 * METHODS
 */

function setMaxAmount(address: string, maxBalance: string) {
  if (isSingleAssetJoin.value) {
    // Set the new Token address, and set the input value to max token balance
    setAmountsIn([
      {
        address: address,
        value: maxBalance,
        valid: true,
      },
    ]);
  } else {
    const isNativeAsset = isSameAddress(address, nativeAsset.address);
    const isWrappedNativeAsset = isSameAddress(
      address,
      wrappedNativeAsset.value.address
    );
    // If the token is ETH or WETH, we find the other one and switch the token address
    if (isNativeAsset || isWrappedNativeAsset) {
      setJoinWithNativeAsset(isNativeAsset);
    }
    // Find the token in the amounts array
    let amountIn: AmountIn | undefined = amountsIn.value.find(item =>
      isSameAddress(address, item.address)
    );

    // Update the amount in values
    if (amountIn) {
      amountIn.valid = true;
      amountIn.value = maxBalance;
    }
  }
}

// Set the input value to max token balance for lecacy invest state
function setMaxAmountForLegacyInvestState(address: string, maxBalance: string) {
  const indexOfAsset = indexOfAddress(tokenAddresses.value, address);

  if (indexOfAsset >= 0) {
    amounts.value[indexOfAsset] = maxBalance;
  }
}

function handleMyWalletTokenClick(address: string, isPoolToken: boolean) {
  const maxBalance = getMaxBalanceFor(address);

  if (supportsJoinPoolProvider.value) {
    if (isPoolToken) {
      setMaxAmount(address, maxBalance);
    } else {
      // If non pool token is clicked, switch to Single Token tab
      activeTab.value = tabs[Tab.SingleToken].value;
      // Wait for the tab to update, the set the max amount
      nextTick(() => {
        setMaxAmount(address, maxBalance);
      });
    }
  } else if (isWethPool.value) {
    // For legacy invest state weth pools, swap the input token between weth and eth

    const isNativeAsset = isSameAddress(address, nativeAsset.address);
    const isWrappedNativeAsset = isSameAddress(
      address,
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
      setMaxAmountForLegacyInvestState(address, maxBalance);
    }, 50);
  } else {
    setMaxAmountForLegacyInvestState(address, maxBalance);
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


