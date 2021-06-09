<template>
  <div class="px-4 md:px-0">
    <div class="trade-card-container mx-auto -mt-6">
      <BalLoadingBlock v-if="appLoading" class="h-96" />
      <TradeCardGP v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';

export default defineComponent({
  components: {
    TradeCardGP
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

<style>
.trade-card-container {
  max-width: 450px;
}
</style>
