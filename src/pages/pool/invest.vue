<script setup lang="ts">
import { computed, ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import { useRoute } from 'vue-router';
// Components
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm2.vue';
import MyPoolBalancesCard from '@/components/cards/MyPoolBalancesCard/MyPoolBalancesCard.vue';
import MyWalletTokensCard from '@/components/cards/MyWalletTokensCard/MyWalletTokensCard.vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * STATE
 */
const id = ref<string>(route.params.id as string);
const useNativeAsset = ref(false);
const { network } = configService;

/**
 * QUERIES
 */
const poolQuery = usePoolQuery(id.value);

/**
 * COMPUTED
 */
const pool = computed((): FullPool | undefined => {
  return poolQuery.data.value;
});

const loadingPool = computed(
  (): boolean =>
    (poolQuery.isLoading.value as boolean) ||
    (poolQuery.isIdle.value as boolean) ||
    (poolQuery.error.value as boolean)
);
</script>

<template>
  <div class="pb-16">
    <div class="invest-header mb-12">
      <div></div>
      <router-link :to="{ name: 'pool', params: { id } }">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>
    <div class="invest-container">
      <div v-if="!upToLargeBreakpoint" class="col-span-2 mt-12">
        <BalLoadingBlock v-if="loadingPool || !pool" class="h-64" />
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
              title: $t('investment.myWalletTokensCard.title'),
              id: 'myWalletTokens'
            },
            {
              title: $t('investment.myPoolBalancesCard.title'),
              id: 'myPoolBalances'
            }
          ]"
        >
          <template #myWalletTokens>
            <BalLoadingBlock v-if="loadingPool || !pool" class="h-64" />
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
            <BalLoadingBlock v-if="loadingPool || !pool" class="h-64" />
            <MyPoolBalancesCard
              v-else
              :pool="pool"
              hideHeader
              noBorder
              square
            />
          </template>
        </BalAccordion>

        <BalLoadingBlock v-if="loadingPool || !pool" class="h-96" />
        <BalCard v-else shadow="xl" exposeOverflow noBorder>
          <template #header>
            <div class="w-full">
              <div class="text-xs text-gray-500 leading-none">
                {{ network.chainName }}
              </div>
              <div class="flex items-center justify-between">
                <h4>{{ $t('investInPool') }}</h4>
                <TradeSettingsPopover :context="TradeSettingsContext.invest" />
              </div>
            </div>
          </template>
          <InvestForm :pool="pool" v-model:useNativeAsset="useNativeAsset" />
        </BalCard>
      </div>

      <div v-if="!upToLargeBreakpoint" class="col-span-2 mt-12">
        <BalLoadingBlock v-if="loadingPool || !pool" class="h-64" />
        <MyPoolBalancesCard v-else :pool="pool" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.invest-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}

.invest-container {
  @apply max-w-xl lg:container mx-auto;
  @apply grid grid-cols-1 lg:grid-cols-7 gap-y-8 gap-x-0 lg:gap-x-8;
}
</style>
