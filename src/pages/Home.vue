<template>
  <div class="container mx-auto px-4 lg:px-0 pt-10 md:pt-12">
    <template v-if="isWalletReady">
      <h3 class="mb-4">{{ $t('myV2Investments') }}</h3>
      <PoolsTable
        :isLoading="isLoadingUserPools"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        class="mb-8"
      />
      <div v-if="!hideV1Links">
        <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
        <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Dashboard" external>{{
          $t('goToBalancerV1Site')
        }}</BalLink>
      </div>
      <div class="mb-16" />
    </template>
    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput
      v-model="selectedTokens"
      :loading="isLoadingPools"
      @add="addSelectedToken"
      @remove="removeSelectedToken"
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
    <div v-if="!hideV1Links">
      <div class="text-black-600">
        {{ $t('tableShowsBalancerV2Pools') }}
      </div>
      <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Explore" external>{{
        $t('exploreBalancerV1Pools')
      }}</BalLink>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAddress } from '@ethersproject/address';

import { EXTERNAL_LINKS } from '@/constants/links';

import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

import PoolsTable from '@/components/tables/PoolsTable.vue';

import usePools from '@/composables/pools/usePools';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady, isV1Supported } = useVueWeb3();
    const {
      selectedTokens,
      addSelectedToken,
      removeSelectedToken
    } = usePoolFilters();

    const {
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools(selectedTokens);

    // COMPUTED
    const filteredPools = computed(() =>
      selectedTokens.value.length > 0
        ? pools.value?.filter(pool => {
            const poolTokenList = pool.tokensList.map(getAddress);

            return selectedTokens.value.every((selectedToken: string) =>
              poolTokenList.includes(selectedToken)
            );
          })
        : pools?.value
    );

    const hideV1Links = computed(() => !isV1Supported);

    return {
      // data
      filteredPools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,

      // computed
      isWalletReady,
      hideV1Links,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedTokens,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
