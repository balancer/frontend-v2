<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import LbpTradeCard from '@/beethovenx/lbp/components/LbpTradeCard.vue';
import LbpStatCards from '@/beethovenx/lbp/components/LbpStatCards.vue';
import LbpDetailWarning from '@/beethovenx/lbp/components/LbpDetailWarning.vue';
import LgeChart from '@/beethovenx/lbp/components/LgeChart.vue';
import { useRoute } from 'vue-router';
import useLgeQuery from '@/beethovenx/lbp/composables/useLgeQuery';
import LgeDetailStatusBanner from '@/beethovenx/lbp/components/LgeDetailStatusBanner.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import LgeDetailProjectDetails from '@/beethovenx/lbp/components/LgeDetailProjectDetails.vue';
import Swaps from '@/components/contextual/pages/pool/PoolTransactionsCard/PoolSwaps/Swaps.vue';
import LbpDetailMultisigWarning from '@/beethovenx/lbp/components/LbpDetailMultisigWarning.vue';

const route = useRoute();
const { injectTokens, tokens } = useTokens();

const poolQuery = usePoolQuery(route.params.id as string);
const loadingPool = computed(
  () =>
    poolQuery.isLoading.value || poolQuery.isIdle.value || poolQuery.error.value
);
const pool = computed(() => {
  return poolQuery.data.value;
});

const { data, error, isLoading, isIdle } = useLgeQuery(
  ref(route.params.id as string)
);

const lge = computed(() => data.value);

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const { blockNumber } = useWeb3();

const enabled = computed(() => !!pool.value?.id);
const swapEnabled = computed(() => pool.value?.swapEnabled);
const launchToken = computed(() =>
  lge.value ? tokens.value[getAddress(lge.value.tokenContractAddress)] : null
);

const tabs = computed(() => [
  { value: 'details', label: `${lge.value?.name || ''} Details` },
  { value: 'swaps', label: 'Swap History' }
]);

const activeTab = ref(tabs.value[0].value);

watch(lge, () => {
  if (lge.value) {
    injectTokens([getAddress(lge.value.tokenContractAddress)]);
  }
});

/**
 * WATCHERS
 */
watch(blockNumber, () => {
  /*refreshStartEndStatus();

  if (refetchQueriesOnBlockNumber.value === blockNumber.value) {
    invalidateQueries();
  } else {
    poolQuery.refetch.value();
    tokenPricesQuery.refetch.value();
  }*/
});
</script>

<template>
  <LgeDetailStatusBanner v-if="lge" :lge="lge" />

  <div class="lg:container lg:mx-auto">
    <LbpDetailWarning />
    <LbpDetailMultisigWarning v-if="lge && !lge.adminIsMultisig" />
    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8 mt-12"
    >
      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div>
            <h2 class="text mb-2 text-4xl">{{ lge?.name }}</h2>
          </div>
          <div class="px-1 lg:px-0">
            <LgeChart v-if="lge && pool" :lge="lge" :pool="pool" />
            <BalLoadingBlock v-else class="h-96" />
          </div>
          <div class="px-1 lg:px-0">
            <div v-if="!lge || !pool">
              <div class="grid grid-cols-4 sm:grid-cols-3 xl:grid-cols-3 gap-4">
                <BalLoadingBlock v-for="n in 3" :key="n" class="h-28" />
              </div>
              <div
                class="grid grid-cols-4 sm:grid-cols-3 xl:grid-cols-3 gap-4 mt-4"
              >
                <BalLoadingBlock v-for="n in 3" :key="n" class="h-28" />
              </div>
            </div>
            <LbpStatCards v-else :lge="lge" :pool="pool" />
            <p class="text-gray-300 mt-4">
              *The predicted price is an estimation assuming no additional
              buyers or sellers.
            </p>
            <p class="text-gray-300">
              <span class="font-bold">Note</span>: Users can both
              <span class="font-bold text-green-500">BUY</span> and
              <span class="font-bold text-red-500">SELL</span>
              during this event. Please be careful.
            </p>
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <div class="pb-2 pt-20">
          <BalLoadingBlock v-if="!lge || !pool || !launchToken" class="h-96" />
          <template v-else>
            <LbpTradeCard
              :swap-enabled="swapEnabled"
              :lge="lge"
              :pool="pool"
              @on-tx="onNewTx"
            />
            <div class="mt-4">
              <img src="~@/beethovenx/assets/images/ludwig-says.svg" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="lge && pool">
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px mt-12" />
      <LgeDetailProjectDetails
        v-if="lge && pool && activeTab === 'details'"
        :lge="lge"
        :pool="pool"
      />
      <div v-if="activeTab === 'swaps'" class="mt-8">
        <Swaps v-if="pool" :pool="pool" />
      </div>
    </div>
  </div>
</template>
