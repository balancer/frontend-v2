<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
// Composables
import { useStore } from 'vuex';

// Components
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TrendingPairs from '@/components/cards/TrendingPairs/TrendingPairs.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';

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
      <TradeCard />
    </template>
    <div class="p-4 sm:p-0 lg:p-0 mt-8">
      <BalAccordion
        v-if="upToLargeBreakpoint"
        class="w-full"
        :sections="[
          { title: 'My wallet', id: 'my-wallet' },
          { title: 'Trending pairs', id: 'trending-pairs' },
          { title: 'Price chart', id: 'price-chart' },
        ]"
      >
        <template #my-wallet>
          <MyWallet />
        </template>
        <template #trending-pairs>
          <TrendingPairs />
        </template>
        <template #price-chart>
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
