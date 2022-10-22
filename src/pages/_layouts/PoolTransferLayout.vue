<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
// Components
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';
// Composables
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import useBreakpoints from '@/composables/useBreakpoints';
import { useReturnRoute } from '@/composables/useReturnRoute';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { usePool } from '@/composables/usePool';
import useNativeBalance from '@/composables/useNativeBalance';
import useTokens from '@/composables/useTokens';
import { isSameAddress } from '@/lib/utils';

/**
 * STATE
 */
const route = useRoute();
const id = (route.params.id as string).toLowerCase();

/**
 * COMPOSABLES
 */
const { tokenAddresses } = useInvestState();
const { getReturnRoute } = useReturnRoute();
const { upToLargeBreakpoint } = useBreakpoints();
const { pool, loadingPool, useNativeAsset, transfersAllowed } =
  usePoolTransfers();
usePoolTransfersGuard();
const { isDeepPool } = usePool(pool);
const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();

const isInvestPage = computed(() => route.name === 'invest');
const poolSupportsSingleAssetSwaps = computed(() => {
  return pool.value && isDeepPool.value;
});
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});
const { nativeAsset } = useTokens();

function handleMyWalletTokenClick(tokenAddress) {
  if (isInvestPage.value && poolSupportsSingleAssetSwaps.value) {
    tokenAddresses.value[0] = tokenAddress;
  } else {
    useNativeAsset.value = isSameAddress(tokenAddress, nativeAsset.address);
  }
}
</script>

<template>
  <StakingProvider :poolAddress="pool?.address">
    <div class="pb-16">
      <div class="mb-12 layout-header">
        <div />
        <BalBtn
          tag="router-link"
          :to="getReturnRoute({ name: 'pool', params: { id } })"
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
          <!-- <MyWalletTokensCard
            v-else
            v-model:useNativeAsset="useNativeAsset"
            :pool="pool"
          /> -->
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
            <!-- <MyWalletTokensCard
              v-else
              v-model:useNativeAsset="useNativeAsset"
              :pool="pool"
              hideHeader
              noBorder
              square
            /> -->
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
