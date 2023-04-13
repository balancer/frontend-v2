<script setup lang="ts">
import { computed, nextTick } from 'vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePoolHelpers.js';
import { isSameAddress, indexOfAddress } from '@/lib/utils';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import { useTokens } from '@/providers/tokens.provider';
import useInvestPageTabs, {
  Tab,
  tabs,
} from '@/composables/pools/useInvestPageTabs';
import { useJoinPool } from '@/providers/local/join-pool.provider';
import { Pool } from '@balancer-labs/sdk';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const pool = computed(() => props.pool);
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});

/**
 * COMPOSABLES
 */
const { useNativeAsset } = usePoolTransfers();
const { isWethPool, isDeepPool } = usePool(pool);
const { tokenAddresses, amounts } = useInvestState();
const { setAmountsIn, isSingleAssetJoin, amountsIn } = useJoinPool();
const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();
const { activeTab } = useInvestPageTabs();

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
  <MyWallet
    includeNativeAsset
    :excludedTokens="excludedTokens"
    :pool="pool"
    @click:asset="handleMyWalletTokenClick"
  />
</template>


