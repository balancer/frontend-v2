<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ENABLE_LEGACY_TRADE_INTERFACE } from '@/composables/trade/constants';
// Types
import { TradeInterface } from '@/store/modules/app';
// Composables
import { useStore } from 'vuex';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokenLists from '@/composables/useTokenLists';
import usePoolFilters from '@/composables/pools/usePoolFilters';
// Components
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import TrendingPairs from '@/components/cards/TrendingPairs/TrendingPairs.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';

/**
 * STATE
 */
const showPriceGraphModal = ref(false);
const hideWidgets = ref(true); // Temp feature flag

/**
 * COMPOSABLES
 */
const store = useStore();
const { loadingTokenLists } = useTokenLists();
const { setSelectedTokens } = usePoolFilters();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const appLoading = computed(() => store.state.app.loading);
const tradeInterface = computed(() => store.state.app.tradeInterface);

/**
 * METHODS
 */
function onPriceGraphModalClose() {
  showPriceGraphModal.value = false;
}

function togglePairPriceGraphModal() {
  showPriceGraphModal.value = !showPriceGraphModal.value;
}

/**
 * CALLBACKS
 */
onMounted(() => {
  // selectedPoolTokens are only persisted between the Home/Pool pages
  setSelectedTokens([]);
});
</script>

<template>
  <Col3Layout offsetGutters mobileHideGutters class="mt-8">
    <template #gutterLeft v-if="!hideWidgets">
      <MyWallet />
      <TrendingPairs class="mt-4" />
    </template>

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

    <template #gutterRight v-if="!hideWidgets">
      <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
    </template>
  </Col3Layout>

  <teleport to="#modal">
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
  </teleport>
</template>

<style scoped>
.graph-modal {
  height: 450px;
}
</style>
