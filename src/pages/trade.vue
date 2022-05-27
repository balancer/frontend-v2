<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
// Composables
import { useStore } from 'vuex';

// Components
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import TrendingPairs from '@/components/cards/TrendingPairs/TrendingPairs.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import { ENABLE_LEGACY_TRADE_INTERFACE } from '@/composables/trade/constants';
import useBreakpoints from '@/composables/useBreakpoints';
// Types
import { TradeInterface } from '@/store/modules/app';

/**
 * STATE
 */
const showPriceGraphModal = ref(false);

/**
 * COMPOSABLES
 */
const store = useStore();
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
    <template #gutterLeft>
      <MyWallet />
      <TrendingPairs class="mt-4" />
    </template>

    <BalLoadingBlock v-if="appLoading" class="h-96" />
    <template v-else>
      <template v-if="ENABLE_LEGACY_TRADE_INTERFACE">
        <TradeCard v-if="tradeInterface === TradeInterface.BALANCER" />
        <TradeCardGP v-else-if="tradeInterface === TradeInterface.GNOSIS" />
      </template>
      <template v-else>
        <TradeCardGP />
      </template>
    </template>
    <div class="mt-8 p-4 sm:p-0 lg:p-0">
      <BalAccordion
        class="w-full"
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

    <template #gutterRight>
      <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
    </template>
  </Col3Layout>

  <teleport to="#modal">
    <BalModal :show="showPriceGraphModal" @close="onPriceGraphModalClose">
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
