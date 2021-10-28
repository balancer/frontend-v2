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

/**
 * STATE
 */
const route = useRoute();
const id = ref<string>(route.params.id as string);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { pool, loadingPool, useNativeAsset } = usePoolTransfers();
</script>

<template>
  <div class="pb-16">
    <div class="layout-header mb-12">
      <div></div>
      <router-link :to="{ name: 'pool', params: { id } }">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>
    <div class="layout-container">
      <div v-if="!upToLargeBreakpoint" class="col-span-2 mt-6">
        <BalLoadingBlock v-if="loadingPool" class="h-64" />
        <MyWalletTokensCard
          v-else
          :pool="pool"
          v-model:useNativeAsset="useNativeAsset"
        />
      </div>

      <div class="col-span-3">
        <BalAccordion
          v-if="upToLargeBreakpoint"
          class="mb-4"
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
            <BalLoadingBlock v-if="loadingPool" class="h-64" />
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
            <BalLoadingBlock v-if="loadingPool" class="h-64" />
            <MyPoolBalancesCard
              v-else
              :pool="pool"
              hideHeader
              noBorder
              square
            />
          </template>
        </BalAccordion>

        <router-view :key="$route.path" />
      </div>

      <div v-if="!upToLargeBreakpoint" class="col-span-2 mt-6">
        <BalLoadingBlock v-if="loadingPool" class="h-64" />
        <MyPoolBalancesCard v-else :pool="pool" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}

.layout-container {
  @apply max-w-xl lg:container mx-auto;
  @apply grid grid-cols-1 lg:grid-cols-7 gap-y-8 gap-x-0 lg:gap-x-8;
}
</style>
