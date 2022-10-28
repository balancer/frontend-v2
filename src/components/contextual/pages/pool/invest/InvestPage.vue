<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { forChange, isSameAddress, indexOfAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import InvestFormV2 from '@/components/forms/pool_actions/InvestForm/InvestFormV2.vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import useBreakpoints from '@/composables/useBreakpoints';

import StakingProvider from '@/providers/local/staking/staking.provider';

import useNativeBalance from '@/composables/useNativeBalance';
import useTokens from '@/composables/useTokens';
import useJoinPool from '@/composables/pools/useJoinPool';
import useInvestPageTabs, { tabs } from '@/composables/pools/useInvestPageTabs';

/**
 * COMPOSABLES
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed, useNativeAsset } =
  usePoolTransfers();
const { isDeepPool, isWethPool } = usePool(pool);
const { sor, sorReady } = useInvestState();
const { activeTab } = useInvestPageTabs();
const { tokenAddresses, amounts } = useInvestState();
const { upToLargeBreakpoint } = useBreakpoints();
const { addTokensIn, setAmountsIn, isSingleAssetJoin, amountsIn } =
  useJoinPool();
const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();
const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();

/**
 * COMPUTED
 */
const poolSupportsGeneralisedJoin = computed(() => {
  return pool.value && isDeepPool.value;
});
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});

/**
 * METHODS
 */
function handleMyWalletTokenClick(tokenAddress: string) {
  const maxBalance = getMaxBalanceFor(tokenAddress);

  if (poolSupportsGeneralisedJoin.value && isSingleAssetJoin.value) {
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

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  await forChange(loadingPool, false);

  if (pool.value && isDeepPool.value) {
    // Initialise SOR for batch swap queries
    sorReady.value = await sor.fetchPools();
  } else {
    sorReady.value = true;
  }
});
</script>

<template>
  <!-- TODO: Move staking provider somewhere else. -->
  <StakingProvider :poolAddress="pool?.address">
    <div class="invest-page-layout-grid">
      <div v-if="!upToLargeBreakpoint" class="col-span-5">
        <BalLoadingBlock
          v-if="loadingPool || !transfersAllowed || !pool"
          class="h-64"
        />
        <div v-else>
          <MyWallet
            includeNativeAsset
            :excludedTokens="excludedTokens"
            :pool="pool"
            @click:asset="handleMyWalletTokenClick"
          />
        </div>
      </div>

      <div class="col-span-7">
        <BalLoadingBlock
          v-if="loadingPool || !transfersAllowed || !sorReady || !pool"
          class="h-96"
        />
        <BalCard v-else shadow="xl" exposeOverflow noBorder>
          <template #header>
            <div class="w-full">
              <div class="text-xs leading-none text-secondary">
                {{ network.chainName }}
              </div>
              <div class="flex justify-between items-center">
                <h4>{{ $t('investInPool') }}</h4>
                <TradeSettingsPopover :context="TradeSettingsContext.invest" />
              </div>
              <BalTabs
                v-if="isDeepPool"
                v-model="activeTab"
                :tabs="tabs"
                class="p-0 m-0 -mb-px whitespace-nowrap"
                noPad
              />
            </div>
          </template>
          <template v-if="isDeepPool">
            <InvestFormV2 :pool="pool" />
          </template>
          <template v-else>
            <InvestForm :pool="pool" />
          </template>
        </BalCard>
      </div>

      <BalAccordion
        v-if="upToLargeBreakpoint"
        class="mt-4"
        :sections="[
          {
            title: poolSupportsGeneralisedJoin
              ? `${$t('myWallet2')} ${
                  hasNativeBalance ? `${nativeBalance} ${nativeCurrency}` : ''
                }`
              : $t('poolTransfer.myWalletTokensCard.title'),
            id: 'myWalletTokens',
          },
        ]"
      >
        <!-- TODO: Show some 404 message if Pool not found -->
        <template #myWalletTokens>
          <BalLoadingBlock
            v-if="loadingPool || !pool || !transfersAllowed"
            class="h-64"
          />
          <div v-else>
            <MyWallet
              includeNativeAsset
              :excludedTokens="excludedTokens"
              :pool="pool"
              @click:asset="handleMyWalletTokenClick"
            />
          </div>
        </template>
      </BalAccordion>
    </div>
  </StakingProvider>
</template>

<style scoped>
.invest-page-layout-grid {
  @apply grid grid-cols-1 lg:grid-cols-12 gap-y-8;
  @apply max-w-3xl mx-auto sm:px-4 lg:px-0 gap-x-0 lg:gap-x-8;
}
</style>
