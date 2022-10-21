<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
// Components
import MyPoolBalancesCard from '@/components/cards/MyPoolBalancesCard/MyPoolBalancesCard.vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import MyWalletTokensCard from '@/components/cards/MyWalletTokensCard/MyWalletTokensCard.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';
// Composables
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import useBreakpoints from '@/composables/useBreakpoints';
import { useReturnRoute } from '@/composables/useReturnRoute';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { usePool } from '@/composables/usePool';
import useNativeBalance from '@/composables/useNativeBalance';

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

function setTokenInAddress(tokenAddress) {
  tokenAddresses.value[0] = tokenAddress;
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

      <Col3Layout offsetGutters mobileHideGutters>
        <template v-if="!upToLargeBreakpoint" #gutterLeft>
          <BalLoadingBlock
            v-if="loadingPool || !transfersAllowed || !pool"
            class="h-64"
          />
          <div v-else-if="isInvestPage && poolSupportsSingleAssetSwaps">
            <MyWallet
              :excludedTokens="excludedTokens"
              :pool="pool"
              @click:asset="setTokenInAddress"
            />
          </div>
          <MyWalletTokensCard
            v-else
            v-model:useNativeAsset="useNativeAsset"
            :pool="pool"
          />
        </template>

        <router-view :key="$route.path" />

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
            {
              title: $t('poolTransfer.myPoolBalancesCard.title'),
              id: 'myPoolBalances',
            },
          ]"
        >
          <!-- TODO: Show some 404 message if Pool not found -->
          <template #myWalletTokens>
            <BalLoadingBlock
              v-if="loadingPool || !pool || !transfersAllowed"
              class="h-64"
            />
            <div v-else-if="isInvestPage && poolSupportsSingleAssetSwaps">
              <MyWallet
                :excludedTokens="excludedTokens"
                :pool="pool"
                @click:asset="setTokenInAddress"
              />
            </div>
            <MyWalletTokensCard
              v-else
              v-model:useNativeAsset="useNativeAsset"
              :pool="pool"
              hideHeader
              noBorder
              square
            />
          </template>
          <template #myPoolBalances>
            <BalLoadingBlock
              v-if="loadingPool || !pool || !transfersAllowed"
              class="h-64"
            />
            <MyPoolBalancesCard
              v-else
              :pool="pool"
              hideHeader
              noBorder
              square
            />
          </template>
        </BalAccordion>

        <template v-if="!upToLargeBreakpoint" #gutterRight>
          <BalLoadingBlock
            v-if="loadingPool || !pool || !transfersAllowed"
            class="h-64"
          />
          <MyPoolBalancesCard v-else :pool="pool" />
        </template>
      </Col3Layout>
    </div>
  </StakingProvider>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}
</style>
