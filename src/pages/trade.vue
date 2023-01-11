<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';
import BridgeLink from '@/components/links/BridgeLink.vue';
import { isL2 } from '@/composables/useNetwork';

/**
 * STATE
 */
const showPriceGraphModal = ref(false);

/**
 * COMPOSABLES
 */
const { setSelectedTokens } = usePoolFilters();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const sections = computed(() => {
  const sections = [
    { title: 'My wallet', id: 'my-wallet' },
    { title: 'Price chart', id: 'price-chart' },
  ];
  if (isL2.value) sections.push({ title: 'Bridge assets', id: 'bridge' });
  return sections;
});

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
  <div>
    <Col3Layout offsetGutters mobileHideGutters class="mt-8">
      <template #gutterLeft>
        <MyWallet />
      </template>

      <TradeCard />
      <div class="p-4 sm:p-0 lg:p-0 mt-8">
        <BalAccordion
          v-if="upToLargeBreakpoint"
          class="w-full"
          :sections="sections"
        >
          <template #my-wallet>
            <MyWallet />
          </template>
          <template #price-chart>
            <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
          </template>
          <template v-if="isL2" #bridge>
            <BridgeLink />
          </template>
        </BalAccordion>
      </div>

      <template #gutterRight>
        <PairPriceGraph :toggleModal="togglePairPriceGraphModal" />
        <BridgeLink v-if="isL2" class="mt-4" />
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
  </div>
</template>

<style scoped>
.graph-modal {
  height: 450px;
}
</style>
