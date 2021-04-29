<template>
  <div class="container mx-auto px-4 lg:px-0">
    <div class="mb-8" />
    <template v-if="isConnected">
      <h3 class="mb-4">{{ $t('myV2Investments') }}</h3>
      <PoolsTable
        :isLoading="isLoadingSharesPools || isWaitingForSharesPoolsQuery"
        :data="poolsShares"
        class="mb-8"
      />
      <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
      <BalLink href="https://pools.balancer.exchange" external>{{
        $t('goToBalancerV1Site')
      }}</BalLink>
      <div class="mb-16" />
    </template>
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

import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

import PoolsTable from '@/components/tables/PoolsTable.vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolsSharesQuery from '@/composables/queries/usePoolsSharesQuery';
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

    // DATA
    const selectedTokens = ref<string[]>([]);

    const {
      data: poolsData,
      isLoading: isLoadingPools,
      isIdle: isWaitingForPoolsQuery
    } = usePoolsQuery();

    const {
      data: poolsSharesData,
      isLoading: isLoadingSharesPools,
      isIdle: isWaitingForSharesPoolsQuery
    } = usePoolsSharesQuery();

    const poolsShares = computed(() => poolsSharesData.value?.pools);
    const poolsSharesIds = computed(() => poolsSharesData.value?.poolIds);

    const pools = computed(() => {
      const filteredPools =
        selectedTokens.value.length > 0
          ? poolsData.value?.pools.filter(pool => {
              const poolTokenList = pool.tokensList.map(getAddress);

              return selectedTokens.value.every(selectedToken =>
                poolTokenList.includes(selectedToken)
              );
            })
          : poolsData.value?.pools;

      return poolsSharesIds.value && poolsSharesIds.value.length > 0
        ? filteredPools?.filter(
            pool => !poolsSharesIds.value?.includes(pool.id)
          )
        : filteredPools;
    });

    return {
      // data
      selectedTokens,
      pools,
      isLoadingPools,
      isWaitingForPoolsQuery,
      poolsShares,
      isLoadingSharesPools,
      isWaitingForSharesPoolsQuery,

      // computed
      isConnected,

      //methods
      router
    };
  }
});
</script>
