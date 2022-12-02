<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
// Components
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';
import useNetwork from '@/composables/useNetwork';
// Composables
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import useBreakpoints from '@/composables/useBreakpoints';
import { useReturnRoute } from '@/composables/useReturnRoute';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { usePool } from '@/composables/usePool';
import useNativeBalance from '@/composables/useNativeBalance';
import useTokens from '@/composables/useTokens';
import {
  // indexOfAddress,
  isSameAddress,
} from '@/lib/utils';

/**
 * STATE
 */
const route = useRoute();
const id = (route.params.id as string).toLowerCase();

/**
 * COMPOSABLES
 */
const {
  tokenAddresses,
  // amounts
} = useInvestState();
const { getReturnRoute } = useReturnRoute();
const { upToLargeBreakpoint } = useBreakpoints();
const { networkSlug } = useNetwork();
const { pool, loadingPool, useNativeAsset, transfersAllowed } =
  usePoolTransfers();
usePoolTransfersGuard();
const { isDeepPool, isWethPool } = usePool(pool);
const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();

const isInvestPage = computed(() => route.name === 'invest');
const poolSupportsSingleAssetSwaps = computed(() => {
  return pool.value && isDeepPool.value;
});
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});
const {
  nativeAsset,
  //  getMaxBalanceFor
} = useTokens();

function handleMyWalletTokenClick(tokenAddress: string) {
  if (isInvestPage.value && poolSupportsSingleAssetSwaps.value) {
    // TODO: Only change the tokenAddress if single asset tab is selected
    tokenAddresses.value[0] = tokenAddress;
  } else if (isWethPool.value) {
    useNativeAsset.value = isSameAddress(tokenAddress, nativeAsset.address);
  }
  //  Max the input amount (ENABLE LATER)

  //  const indexOfAsset = indexOfAddress(tokenAddresses.value, tokenAddress);

  //  if (indexOfAsset >= 0) {
  //    amounts.value[indexOfAsset] = getMaxBalanceFor(tokenAddress);
  //   }
}
</script>

<template>
  <StakingProvider :poolAddress="pool?.address">
    <div class="pb-16">
      <div class="mb-12 layout-header">
        <div />
        <BalBtn
          tag="router-link"
          :to="getReturnRoute({ name: 'pool', params: { id, networkSlug } })"
          color="white"
          circle
        >
          <BalIcon name="x" size="lg" />
        </BalBtn>
      </div>
      <div class="pool-transfer-layout-grid">
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
          <router-view :key="$route.path" />
        </div>

        <BalAccordion
          v-if="upToLargeBreakpoint"
          class="mt-4"
          :sections="[
            {
              title:
                isInvestPage && poolSupportsSingleAssetSwaps
                  ? `${$t('myWallet2')} ${
                      hasNativeBalance
                        ? `${nativeBalance} ${nativeCurrency}`
                        : ''
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
    </div>
  </StakingProvider>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}

.pool-transfer-layout-grid {
  @apply grid grid-cols-1 lg:grid-cols-12 gap-y-8;
  @apply max-w-3xl mx-auto sm:px-4 lg:px-0 gap-x-0 lg:gap-x-8;
}
</style>
