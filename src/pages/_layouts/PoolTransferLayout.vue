<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
// Components
import MyPoolBalancesCard from '@/components/cards/MyPoolBalancesCard/MyPoolBalancesCard.vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import MyWalletTokensCard from '@/components/cards/MyWalletTokensCard/MyWalletTokensCard.vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';
// Composables
import useBreakpoints from '@/composables/useBreakpoints';
import { isStablePhantom } from '@/composables/usePool';
import { useReturnRoute } from '@/composables/useReturnRoute';

/**
 * STATE
 */
const route = useRoute();
const id = ref<string>(route.params.id as string);

/**
 * COMPOSABLES
 */
const { getReturnRoute } = useReturnRoute();
const { upToLargeBreakpoint } = useBreakpoints();
const { pool, loadingPool, useNativeAsset, transfersAllowed } =
  usePoolTransfers();
const { tokenAddresses } = useInvestState();
usePoolTransfersGuard();

function setTokenInAddress(tokenAddress) {
  tokenAddresses.value[0] = tokenAddress;
}

const isInvestPage = computed(() => route.name === 'invest');

const poolSupportsSingleAssetSwaps = computed(() => {
  return pool.value && isStablePhantom(pool.value.poolType);
});

// Exclude BPT from the list of tokens that can be used to invest in the pool.
const excludedTokens = computed<string[]>(() => {
  return pool.value?.address ? [pool.value.address] : [];
});
</script>

<template>
  <div class="pb-16">
    <div class="mb-12 layout-header">
      <div />
      <router-link :to="getReturnRoute({ name: 'pool', params: { id } })">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>

    <Col3Layout offsetGutters mobileHideGutters>
      <template v-if="!upToLargeBreakpoint" #gutterLeft>
        <BalLoadingBlock v-if="loadingPool || !transfersAllowed" class="h-64" />
        <div v-else-if="isInvestPage && poolSupportsSingleAssetSwaps">
          <MyWallet
            :excludedTokens="excludedTokens"
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
            title: $t('poolTransfer.myWalletTokensCard.title'),
            id: 'myWalletTokens',
          },
          {
            title: $t('poolTransfer.myPoolBalancesCard.title'),
            id: 'myPoolBalances',
          },
        ]"
      >
        <template #myWalletTokens>
          <BalLoadingBlock
            v-if="loadingPool || !transfersAllowed"
            class="h-64"
          />
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
            v-if="loadingPool || !transfersAllowed"
            class="h-64"
          />
          <MyPoolBalancesCard v-else :pool="pool" hideHeader noBorder square />
        </template>
      </BalAccordion>

      <template v-if="!upToLargeBreakpoint" #gutterRight>
        <BalLoadingBlock v-if="loadingPool || !transfersAllowed" class="h-64" />
        <MyPoolBalancesCard v-else :pool="pool" />
      </template>
    </Col3Layout>
  </div>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}
</style>
