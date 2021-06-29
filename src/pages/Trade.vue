<template>
  <div>
    <div class="trade-container">
      <BalLoadingBlock v-if="appLoading" class="h-96" />
      <template v-else>
        <TradeCard v-if="tradeInterface === TradeInterface.BALANCER" />
        <TradeCardGP v-else-if="tradeInterface === TradeInterface.GNOSIS" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import { TradeInterface } from '@/store/modules/app';

export default defineComponent({
  components: {
    TradeCard,
    TradeCardGP
  },

  setup() {
    // COMPOSABLES
    const store = useStore();

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);
    const tradeInterface = computed(() => store.state.app.tradeInterface);

    // METHODS
    function clearSelectedPoolTokens() {
      store.commit('app/setSelectedPoolTokens', []);
    }

    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      clearSelectedPoolTokens();
    });

    return {
      appLoading,
      tradeInterface,
      TradeInterface
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
