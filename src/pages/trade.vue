<template>
  <div class="lg:flex justify-center flex-col lg:flex-row">
    <div
      v-if="
        !upToLargeBreakpoint &&
          !(appLoading || loadingTokenLists) &&
          !hideWidgets
      "
      class="mt-16 mr-6 flex flex-col widget-card"
    >
      <MyWallet />
      <div class="mt-4">
        <TrendingPairs />
      </div>
    </div>
    <div class="trade-container mx-auto lg:mx-0">
      <BalLoadingBlock v-if="appLoading || loadingTokenLists" class="h-96" />
      <template v-else>
        <template v-if="ENABLE_LEGACY_TRADE_INTERFACE">
          <TradeCard v-if="tradeInterface === TradeInterface.BALANCER" />
          <TradeCardGP v-else-if="tradeInterface === TradeInterface.GNOSIS" />
        </template>
        <template v-else>
          <TradeCardGP />
        </template>
      </template>
      <div v-if="!hideWidgets" class="mt-8 p-4 sm:p-0 lg:p-0">
        <BalAccordion
          class="accordion-mw w-full"
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
            <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
          </template>
        </BalAccordion>
      </div>
    </div>
    <div
      v-if="
        !upToLargeBreakpoint &&
          !(appLoading || loadingTokenLists) &&
          !hideWidgets
      "
      class="mt-16 ml-6 flex flex-col widget-card relative"
    >
      <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
    </div>
    <BalModal
      :show="showPriceGraphModal && !hideWidgets"
      @close="onPriceGraphModalClose"
    >
      <div class="graph-modal">
        <PairPriceGraph
          :toggleModal="togglePairPriceGraphModal"
          isModal
          :onCloseModal="onPriceGraphModalClose"
        />
      </div>
    </BalModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
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
import { ENABLE_LEGACY_TRADE_INTERFACE } from '@/composables/trade/constants';

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
    const showPriceGraphModal = ref(false);
    // manual flag while subgraph syncs
    const hideWidgets = true;
    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);
    const tradeInterface = computed(() => store.state.app.tradeInterface);
    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      setSelectedTokens([]);
    });

    const onPriceGraphModalClose = () => {
      showPriceGraphModal.value = false;
    };

    const togglePairPriceGraphModal = () => {
      showPriceGraphModal.value = !showPriceGraphModal.value;
    };

    return {
      appLoading,
      tradeInterface,
      loadingTokenLists,
      TradeInterface,
      upToLargeBreakpoint,
      showPriceGraphModal,
      hideWidgets,
      togglePairPriceGraphModal,
      onPriceGraphModalClose,
      ENABLE_LEGACY_TRADE_INTERFACE
    };
  }
});
</script>

<style scoped>
.trade-container {
  @apply mt-2 xs:mt-8 w-full;
  max-width: 450px;
}

.graph-modal {
  height: 450px;
}

@media (min-height: 840px) {
  .trade-container {
    @apply md:mt-8;
  }
  .accordion-mw {
  }
}
.widget-card {
  width: 260px;
}
</style>
