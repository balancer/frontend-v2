<template>
  <div class="flex justify-center items-center flex-col lg:flex-row">
    <div
      v-if="!upToLargeBreakpoint && !(appLoading || loadingTokenLists)"
      class="mt-16 mr-6 flex flex-col widget-card"
    >
      <MyWallet />
      <div class="mt-4">
        <TrendingPairs />
      </div>
    </div>
    <div class="trade-container">
      <BalLoadingBlock v-if="appLoading || loadingTokenLists" class="h-96" />
      <template v-else>
        <TradeCard v-if="tradeInterface === TradeInterface.BALANCER" />
        <TradeCardGP v-else-if="tradeInterface === TradeInterface.GNOSIS" />
      </template>
    </div>
    <div
      v-if="!upToLargeBreakpoint && !(appLoading || loadingTokenLists)"
      class="mt-16 ml-6 flex flex-col widget-card relative"
    >
      <PairPriceGraph />
    </div>
    <div class="px-4 mt-8">

    <BalAccordion
      class="accordion-mw"
      v-if="upToLargeBreakpoint"
      :sections="[
        { title: 'My wallet', id: 'my-wallet' },
        { title: 'Trending pairs', id: 'trending-pairs' },
        { title: 'Price chart', id: 'price-chart' }
      ]"
    >
      <template v-slot:my-wallet>
        <MyWallet />
      </template>
      <template v-slot:trending-pairs>
        <TrendingPairs />
      </template>
      <template v-slot:price-chart>
        <PairPriceGraph />
      </template>
    </BalAccordion>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import useTokenLists from '@/composables/useTokenLists';
import { TradeInterface } from '@/store/modules/app';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import TrendingPairs from '@/components/cards/TrendingPairs/TrendingPairs.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  components: {
    TradeCard,
    TradeCardGP,
    MyWallet,
    TrendingPairs,
    PairPriceGraph
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists } = useTokenLists();
    const { setSelectedTokens } = usePoolFilters();
    const { upToLargeBreakpoint } = useBreakpoints();
    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);
    const tradeInterface = computed(() => store.state.app.tradeInterface);

    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      setSelectedTokens([]);
    });

    return {
      appLoading,
      tradeInterface,
      loadingTokenLists,
      TradeInterface,
      upToLargeBreakpoint
    };
  }
});
</script>

<style scoped>
.trade-container {
  @apply max-w-full mt-2 xs:mt-8;
  max-width: 450px;
}

@media (min-height: 840px) {
  .trade-container {
    @apply md:mt-8;
  }
}
.widget-card {
  width: 260px;
}

.accordion-mw {
  min-width: 450px;
}
</style>
