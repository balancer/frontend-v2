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
import { defineComponent, computed, ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import SubNav from '@/components/navs/SubNav.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import { useQuery } from 'vue-query';
import useWeb3 from '@/composables/useWeb3';
import { getPoolsWithVolume } from '@/utils/balancer/pools';
import useTokens from '@/composables/useTokens';
import { useRouter } from 'vue-router';
import { isEmpty } from 'lodash';
import PoolsTable from '@/components/tables/PoolsTable.vue';

export default defineComponent({
  components: {
    SubNav,
    TokenSearchInput,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { userNetwork } = useWeb3();
    const prices = computed(() => store.state.market.prices);
    const { allTokens } = useTokens();
    const router = useRouter();

    // DATA
    const selectedTokens = ref<string[]>([]);
    const poolData = computed(() => store.state.pools.all);
    const shouldLoadPools = computed(() => !isEmpty(prices.value));

    const {
      data: pools,
      isLoading: isLoadingPools,
      isIdle: isWaitingForPoolsQuery
    } = useQuery(
      reactive([
        'poolsData',
        {
          userNetwork,
          prices,
          selectedTokens
        }
      ]),
      () =>
        getPoolsWithVolume({
          chainId: userNetwork.value.key,
          prices: prices.value,
          tokenIds: selectedTokens.value
        }),
      reactive({
        enabled: shouldLoadPools,
        onSuccess: async pools => {
          const tokens = pools
            .map(pool => pool.tokens.map(token => getAddress(token.address)))
            .reduce((a, b) => [...a, ...b], []);
          await store.dispatch('registry/injectTokens', tokens);
        }
      })
    );

    return {
      // data
      poolData,
      selectedTokens,
      pools,
      isLoadingPools,
      allTokens,
      isWaitingForPoolsQuery,

      //methods
      getAddress,
      router
    };
  }
});
</script>
