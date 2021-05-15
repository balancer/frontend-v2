<template>
  <div>
    <div class="trade-container">
      <BalLoadingBlock v-if="appLoading" class="h-96" />
      <TradeCard v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';

export default defineComponent({
  components: {
    TradeCard
  },

  setup() {
    // COMPOSABLES
    const store = useStore();

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);

    // METHODS
    function clearSelectedPoolTokens() {
      store.commit('app/setSelectedPoolTokens', []);
    }

    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      clearSelectedPoolTokens();
    });

    return {
      appLoading
    };
  }
});
</script>

<style scoped>
.trade-container {
  @apply max-w-full mx-auto mt-2 xs:mt-8 md:-mt-6;
  max-width: 420px;
}

@media (min-height: 840px) {
  .trade-container {
    @apply md:mt-8;
  }
}

.trade-container .bal-card .header {
  @apply pb-0;
}
</style>
