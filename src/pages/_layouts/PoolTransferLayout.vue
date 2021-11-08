<script setup lang="ts">
import { ref } from 'vue';
// Composables
import useBreakpoints from '@/composables/useBreakpoints';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { useRoute } from 'vue-router';
// Components
import MyPoolBalancesCard from '@/components/cards/MyPoolBalancesCard/MyPoolBalancesCard.vue';
import MyWalletTokensCard from '@/components/cards/MyWalletTokensCard/MyWalletTokensCard.vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';

/**
 * STATE
 */
const route = useRoute();
const id = ref<string>(route.params.id as string);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const {
  pool,
  loadingPool,
  useNativeAsset,
  transfersAllowed
} = usePoolTransfers();
usePoolTransfersGuard();
</script>

<template>
  <div class="pb-16">
    <div class="layout-header mb-12">
      <div></div>
      <router-link :to="{ name: 'pool', params: { id } }">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>

    <Col3Layout offsetGutters mobileHideGutters>
      <template #gutterLeft v-if="!upToLargeBreakpoint">
        <BalLoadingBlock v-if="loadingPool || !transfersAllowed" class="h-64" />
        <MyWalletTokensCard
          v-else
          :pool="pool"
          v-model:useNativeAsset="useNativeAsset"
        />
      </template>

      <router-view :key="$route.path" />

      <BalAccordion
        v-if="upToLargeBreakpoint"
        class="mt-4"
        :sections="[
          {
            title: $t('poolTransfer.myWalletTokensCard.title'),
            id: 'myWalletTokens'
          },
          {
            title: $t('poolTransfer.myPoolBalancesCard.title'),
            id: 'myPoolBalances'
          }
        ]"
      >
        <template #myWalletTokens>
          <BalLoadingBlock
            v-if="loadingPool || !transfersAllowed"
            class="h-64"
          />
          <MyWalletTokensCard
            v-else
            :pool="pool"
            v-model:useNativeAsset="useNativeAsset"
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

      <template #gutterRight v-if="!upToLargeBreakpoint">
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
