<template>
  <div class="container mx-auto">
    <SubNav class="mb-8" />
    <div class="mt-16">
      <BalLineChart
        :isLoading="isLoadingChartData || isAppLoading"
        name="Value ($)"
        :axis="portfolioChartData?.axis"
        :data="portfolioChartData?.data"
        dataKey="id"
        :onPeriodSelected="handleGraphingPeriodChange"
        :currentGraphingPeriod="currentGraphingPeriod"
      />
    </div>
    <div>
      <h3 class="text-gray-800 font-semibold text-xl tracking-wide mt-8">
        My V2 Investments
      </h3>
      <BalCard shadow="lg" class="mt-8" no-pad>
        <BalTable
          :columns="columns"
          :data="pools"
          :isLoading="isLoadingPools || isAppLoading || isInjectingTokens"
          skeletonClass="h-64"
          sticky="both"
          :dataKey="id"
        >
          <template v-slot:iconColumnHeader>
            <div class="flex items-center">
              <img :src="require('@/assets/icons/token_header.svg')" />
            </div>
          </template>
          <template v-slot:iconColumnCell="pool">
            <div class="px-6 py-8 flex flex-row icon">
              <div v-for="token in pool.tokens" :key="token">
                <Token :token="tokens[token]" />
              </div>
            </div>
          </template>
          <template v-slot:poolNameCell="pool">
            <div class="px-6 py-8">
              <span
                v-for="(token, i) in pool.tokens"
                :key="token"
                class="inline-block mr-1"
              >
                <span class="dot">•</span>
                {{ pool.weightsPercent[i] }}
                {{ tokens[token].symbol }}
              </span>
            </div>
          </template>
          <!-- <template v-slot:stakeButtonCell>
            <div class="px-6 py-4 flex items-center">
              <BalBtn size="sm" color="blue">Stake</BalBtn>
            </div>
          </template> -->
        </BalTable>
      </BalCard>
    </div>
    <!-- <BlockMyWallet v-if="account" :loading="loading" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import { useI18n } from 'vue-i18n';
import SubNav from '@/components/navs/SubNav.vue';
import useWeb3 from '@/composables/useWeb3';
import { useQuery } from 'vue-query';

import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  components: {
    SubNav
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const {
      account,
      blockNumber,
      loading: isWeb3Loading,
      userNetwork
    } = useWeb3();
    const { fNum } = useNumbers();
    // DATA
    const columns = ref([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        className: 'cell'
      },
      {
        name: 'Pool Name',
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        className: 'w-full'
      },
      {
        name: 'My Balance',
        accessor: pool => fNum(getPoolShare(pool), 'usd'),
        className: 'cell',
        align: 'right',
        id: 'myBalance'
      },
      {
        name: 'Pool Value',
        accessor: pool => fNum(pool.liquidity, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolValue'
      },
      {
        name: 'Vol (24h)',
        accessor: pool => fNum(pool.volume, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolVolume'
      },
      {
        name: 'APY (1y)',
        accessor: pool => `${fNum(pool.apy, 'percent')}`,
        className: 'cell',
        align: 'right',
        id: 'poolApy'
      }
      // {
      //   name: 'Staking',
      //   accessor: 'stake',
      //   Cell: 'stakeButtonCell',
      //   className: 'cell'
      // }
    ]);
    const totalBalance = ref(0);
    const currentGraphingPeriod = ref(30);
    const isInjectingTokens = ref(true);

    const isAppLoading = computed(() => store.state.app.loading);
    const isPageLoading = computed(
      () => isAppLoading.value || isWeb3Loading.value
    );
    const areQueriesEnabled = computed(() => !isPageLoading.value);
    const provider = computed(() => getProvider(networkKey.value));
    const networkKey = computed(() => userNetwork.value.key);
    const { allTokens } = useTokens();

    const {
      data: portfolioChartData,
      isLoading: isLoadingChartData,
      isFetching: isFetchingMoreChartData
    } = useQuery<any, any>(
      reactive(['chartData', { networkKey, account, currentGraphingPeriod }]),
      () =>
        getPoolSharesChart(
          networkKey.value,
          blockNumber.value,
          account.value,
          currentGraphingPeriod.value
        ),
      reactive({
        enabled: areQueriesEnabled
      })
    );

    const { data: pools, isLoading: isLoadingPools } = useQuery(
      reactive(['portfolioPools', { networkKey, provider, account }]),
      () => getPoolsWithShares(networkKey.value, provider.value, account.value),
      reactive({
        enabled: areQueriesEnabled,
        onSuccess: async pools => {
          const tokens = pools
            .map(pool => pool.tokens)
            .reduce((a, b) => [...a, ...b], []);
          await injectTokens(tokens);
          isInjectingTokens.value = false;
        }
      })
    );

    // METHODS
    const getPoolShare = (pool: {
      liquidity: number;
      totalSupply: BigNumber;
      shares: number;
    }) => {
      if (!pool.shares) return 0;
      return (
        (pool.liquidity / parseFloat(formatUnits(pool.totalSupply, 18))) *
        pool.shares
      );
    };

    const injectTokens = tokens =>
      store.dispatch('registry/injectTokens', tokens);

    const handleGraphingPeriodChange = (newPeriod: number) => {
      currentGraphingPeriod.value = newPeriod;
    };

    return {
      // data
      totalBalance,
      pools,
      isLoadingPools,
      // computed
      account,
      isWeb3Loading,
      isAppLoading,
      isPageLoading,
      tokens: allTokens,
      isLoadingChartData,
      portfolioChartData,
      isFetchingMoreChartData,
      isInjectingTokens,
      currentGraphingPeriod,
      // methods
      fNum,
      t,
      columns,
      handleGraphingPeriodChange
    };
  }
});
</script>

<style>
.cell {
  min-width: 8rem;
}
.icon > :not(:last-child) {
  margin-right: 0.5rem;
}
.dot {
  color: #44d7b6;
}
</style>
