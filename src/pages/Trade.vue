<template>
  <div class="px-4 md:px-0">
    <div class="max-w-full sm:max-w-lg md:max-w-md lg:max-w-sm mx-auto -mt-6">
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
