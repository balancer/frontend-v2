<template>
  <div class="px-4 md:px-0">
    <div class="trade-card-container mx-auto -mt-6">
      <BalLoadingBlock v-if="appLoading" class="h-96" />
      <template v-else>
        <TradeCard v-if="tradeInterface === 'balancer'" />
        <TradeCardGP v-else-if="tradeInterface === 'gnosis'" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';

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
      tradeInterface
    };
  }
});
</script>

<style>
.trade-card-container {
  max-width: 450px;
}
</style>
