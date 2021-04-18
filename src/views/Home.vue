<template>
  <div class="container mx-auto">
    <SubNav class="mb-8" />

    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput v-model="selectedTokens" :loading="loading" />

    <BalLoadingBlock v-if="loading" class="h-96" />
    <PoolsTable
      v-else
      :pools="poolData.pools"
      :snapshots="poolData.snapshots"
      :selected-tokens="selectedTokens"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import SubNav from '@/components/navs/SubNav.vue';
import PoolsTable from '@/components/tables/PoolsTable.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

export default defineComponent({
  components: {
    SubNav,
    PoolsTable,
    TokenSearchInput
  },

  setup() {
    // COMPOSABLES
    const store = useStore();

    // DATA
    const loading = ref(true);
    const selectedTokens = ref<string[]>([]);

    // METHODS
    async function fetchPoolTokens(): Promise<void> {
      try {
        const pools = store.state.pools.all.pools;
        const tokens = pools
          .map(pool => pool.tokens.map(token => getAddress(token.address)))
          .reduce((a, b) => [...a, ...b], []);
        await store.dispatch('registry/injectTokens', tokens);
      } catch (error) {
        console.error(error);
      }
    }

    // CALLBACKS
    onBeforeMount(async () => {
      try {
        await store.dispatch('pools/getAll');
        await fetchPoolTokens();
        loading.value = false;
      } catch (error) {
        console.error(error);
      }
    });

    return {
      loading,
      poolData: computed(() => store.state.pools.all),
      selectedTokens
    };
  }
});
</script>
