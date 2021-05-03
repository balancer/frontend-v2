<template>
  <div class="container mx-auto px-4 lg:px-0 pt-8">
    <template v-if="isConnected">
      <h3 class="mb-4">{{ $t('myV2Investments') }}</h3>
      <PoolsTable
        :isLoading="isLoadingPoolsWithShares"
        :data="poolsWithShares"
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
    <TokenSearchInput v-model="selectedTokens" :loading="isLoadingPools" />
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="filteredPools"
      :noPoolsLabel="$t('noPoolsFound')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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
    const router = useRouter();
    const { isConnected } = useWeb3();
    const {
      pools,
      poolsWithShares,
      isLoadingPools,
      isLoadingPoolsWithShares
    } = usePools();

    // DATA
    const selectedTokens = ref<string[]>([]);

    const filteredPools = computed(() =>
      selectedTokens.value.length > 0
        ? pools.value?.filter(pool => {
            const poolTokenList = pool.tokensList.map(getAddress);

            return selectedTokens.value.every(selectedToken =>
              poolTokenList.includes(selectedToken)
            );
          })
        : pools
    );

    return {
      // data
      selectedTokens,
      filteredPools,
      poolsWithShares,
      isLoadingPools,
      isLoadingPoolsWithShares,

      // computed
      isConnected,

      //methods
      router,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
