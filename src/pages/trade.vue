<template>
  <div>
    <div class="trade-container">
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
import { ENABLE_LEGACY_TRADE_INTERFACE } from '@/composables/trade/constants';

export default defineComponent({
  components: {
    TradeCard,
    TradeCardGP
  },
  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists } = useTokenLists();
    const { setSelectedTokens } = usePoolFilters();
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
      ENABLE_LEGACY_TRADE_INTERFACE
    };
  }
});
</script>

<style scoped>
.trade-container {
  @apply max-w-full mx-auto mt-2 xs:mt-8;
  max-width: 450px;
}
@media (min-height: 840px) {
  .trade-container {
    @apply md:mt-8;
  }
}
</style>
