<template>
  <div class="container mx-auto px-4 lg:px-0 pt-10 md:pt-12">
    <template v-if="isConnected">
      <h3 class="mb-4">{{ $t('myV2Investments') }}</h3>
      <PoolsTable
        :isLoading="isLoadingUserPools"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        class="mb-8"
      />
      <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
      <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Dashboard" external>{{
        $t('goToBalancerV1Site')
      }}</BalLink>
      <div class="mb-16" />
    </template>
    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput
      v-model="selectedPoolTokens"
      :loading="isLoadingPools"
      @update:modelValue="updateSelectedPoolTokens"
    />
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="filteredPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      class="mb-8"
    />
    <div class="text-black-600">{{ $t('tableShowsBalancerV2Pools') }}</div>
    <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Explore" external>{{
      $t('exploreBalancerV1Pools')
    }}</BalLink>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';

import { EXTERNAL_LINKS } from '@/constants/links';

import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

import PoolsTable from '@/components/tables/PoolsTable.vue';

import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/composables/useWeb3';

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const router = useRouter();
    const { isConnected } = useWeb3();

    const selectedPoolTokens = computed(
      () => store.state.app.selectedPoolTokens
    );

    const {
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools(selectedPoolTokens);

    // COMPUTED
    const filteredPools = computed(() =>
      selectedPoolTokens.value.length > 0
        ? pools.value?.filter(pool => {
            const poolTokenList = pool.tokensList.map(getAddress);

            return selectedPoolTokens.value.every((selectedToken: string) =>
              poolTokenList.includes(selectedToken)
            );
          })
        : pools?.value
    );

    // METHODS
    function updateSelectedPoolTokens(selectedPoolTokens: string[]) {
      store.commit('app/setSelectedPoolTokens', selectedPoolTokens);
    }

    return {
      // data
      filteredPools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,

      // computed
      isConnected,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedPoolTokens,

      //methods
      router,
      loadMorePools,
      updateSelectedPoolTokens,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
