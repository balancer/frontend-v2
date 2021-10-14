<template>
  <div>
    <div class="trade-container">
      <BalLoadingBlock v-if="appLoading || loadingTokenLists" class="h-96" />
      <TradeCardGP v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import useTokenLists from '@/composables/useTokenLists';
import usePoolFilters from '@/composables/pools/usePoolFilters';

export default defineComponent({
  components: {
    TradeCardGP
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists } = useTokenLists();
    const { setSelectedTokens } = usePoolFilters();

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);

    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      setSelectedTokens([]);
    });

    return {
      appLoading,
      loadingTokenLists
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
