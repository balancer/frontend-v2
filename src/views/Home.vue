<template>
  <div class="container mx-auto">
    <SubNav class="mb-8" />

    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <BalLoadingBlock v-if="loading" class="h-12 mb-4" />
    <div
      v-else
      class="border rounded-lg flex items-center h-12 bg-white px-4 mb-4 text-gray-500"
      @click.prevent="selectTokenModal = true"
    >
      <BalIcon name="search" size="sm" class="mr-4" />
      <span v-if="selectedTokens.length === 0">{{ $t('searchBy') }}</span>
      <BalChip
        v-else
        v-for="(token, i) in selectedTokens"
        class="mr-2"
        :key="token"
        size="md"
        color="gray"
        :closeable="true"
        @closed="removeToken(i)"
        @click.stop
      >
        <Token
          :token="allTokens[token]"
          :symbol="false"
          :size="20"
          class="flex-auto"
        />
        <span class="ml-1">{{ allTokens[token].symbol }}</span>
      </BalChip>
    </div>

    <BalLoadingBlock v-if="loading" class="h-96" />
    <PoolsTable
      v-else
      :pools="poolData.pools"
      :snapshots="poolData.snapshots"
      :selected-tokens="selectedTokens"
    />

    <teleport to="#modal">
      <SelectTokenModal
        :open="selectTokenModal"
        :excluded-tokens="selectedTokens"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import SubNav from '@/components/navs/SubNav.vue';
import PoolsTable from '@/components/tables/PoolsTable.vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';

export default defineComponent({
  components: {
    SubNav,
    PoolsTable,
    SelectTokenModal
  },

  setup() {
    // COMPOSABLES
    const store = useStore();

    // DATA
    const loading = ref(true);
    const selectTokenModal = ref(false);
    const selectedTokens = ref<string[]>([]);

    // COMPUTED
    const allTokens = computed(() => store.getters['registry/getTokens']());

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

    function addToken(token: string) {
      selectedTokens.value.push(token);
    }

    function removeToken(i: number) {
      selectedTokens.value.splice(i, 1);
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
      selectTokenModal,
      selectedTokens,
      addToken,
      removeToken,
      allTokens
    };
  }
});
</script>
