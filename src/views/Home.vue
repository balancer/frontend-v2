<template>
  <div class="container mx-auto px-4 lg:px-0">
    <div class="mb-8" />
    <template v-if="isConnected">
      <h3 class="mb-4">{{ $t('myV2Investments') }}</h3>
      <PoolsTable
        :isLoading="isLoadingPoolsWithShares"
        :data="poolsWithShares"
        showPoolShares
        class="mb-8"
      />
      <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
      <BalLink href="https://pools.balancer.exchange" external>{{
        $t('goToBalancerV1Site')
      }}</BalLink>
      <div class="mb-16" />
    </template>
    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput v-model="selectedTokens" :loading="isLoadingPools" />
    <PoolsTable :isLoading="isLoadingPools" :data="pools" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAddress } from '@ethersproject/address';

import { bnum } from '@/utils';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';

import PoolsTable from '@/components/tables/PoolsTable.vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolSharesQuery from '@/composables/queries/usePoolSharesQuery';
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
    const poolsQuery = usePoolsQuery();
    const poolSharesQuery = usePoolSharesQuery();

    // DATA
    const selectedTokens = ref<string[]>([]);

    const pools = computed(() =>
      selectedTokens.value.length > 0
        ? poolsQuery.data.value?.pools.filter(pool => {
            const poolTokenList = pool.tokensList.map(getAddress);

            return selectedTokens.value.every(selectedToken =>
              poolTokenList.includes(selectedToken)
            );
          })
        : poolsQuery.data.value?.pools
    );

    const poolsWithShares = computed(() => {
      if (isConnected.value && poolSharesQuery.data.value) {
        const { poolSharesMap, poolSharesIds } = poolSharesQuery.data.value;

        return poolsQuery.data.value?.pools
          .filter(pool => poolSharesIds.includes(pool.id))
          .map(pool => ({
            ...pool,
            shares: bnum(pool.totalLiquidity)
              .div(pool.totalShares)
              .times(poolSharesMap[pool.id].balance)
              .toString()
          }));
      }
      return [];
    });

    const isLoadingPools = computed(
      () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
    );

    const isLoadingPoolsWithShares = computed(
      () => poolSharesQuery.isLoading.value || poolSharesQuery.isIdle.value
    );

    return {
      // data
      selectedTokens,
      pools,
      poolsWithShares,
      isLoadingPoolsWithShares,
      isLoadingPools,

      // computed
      isConnected,

      //methods
      router
    };
  }
});
</script>
