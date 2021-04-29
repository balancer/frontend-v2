<template>
  <div class="container mx-auto px-4 lg:px-0">
    <SubNav class="mb-8" />
    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput
      v-model="selectedTokens"
      :loading="isLoadingPools || isWaitingForPoolsQuery"
    />
    <PoolsTable
      :isLoading="isLoadingPools || isWaitingForPoolsQuery"
      :data="pools"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAddress } from '@ethersproject/address';

import SubNav from '@/components/navs/SubNav.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

import useTokens from '@/composables/useTokens';
import PoolsTable from '@/components/tables/PoolsTable.vue';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';

export default defineComponent({
  components: {
    SubNav,
    TokenSearchInput,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const { allTokens } = useTokens();
    const router = useRouter();

    // DATA
    const selectedTokens = ref<string[]>([]);

    const {
      data: poolsData,
      isLoading: isLoadingPools,
      isIdle: isWaitingForPoolsQuery
    } = usePoolsQuery();

    const pools = computed(() =>
      selectedTokens.value.length > 0
        ? poolsData.value?.pools.filter(pool => {
            const poolTokenList = pool.tokensList.map(getAddress);

            return selectedTokens.value.every(selectedToken =>
              poolTokenList.includes(selectedToken)
            );
          })
        : poolsData.value?.pools
    );

    return {
      // data
      selectedTokens,
      pools,
      isLoadingPools,
      allTokens,
      isWaitingForPoolsQuery,

      //methods
      router
    };
  }
});
</script>
