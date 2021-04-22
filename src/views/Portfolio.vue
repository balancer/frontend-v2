<template>
  <div class="container mx-auto">
    <SubNav class="mb-8" />
    <BalLoadingBlock v-if="isLoadingChartData" class="h-96 mt-16" />
    <div class="mt-16">
      <bal-chart
        v-if="!isLoadingChartData"
        name="Value ($)"
        :axis="portfolioChartData?.axis"
        :data="portfolioChartData?.data"
        dataKey="id"
        :onPeriodSelected="handleGraphingPeriodChange"
      />
    </div>
    <div>
      <h3 class="text-gray-800 font-semibold text-xl tracking-wide mt-8">
        My V2 Investments
      </h3>
      <div class="shadow-lg mt-8">
        {{ isLoadingPools }}
        <bal-table
          :columns="columns"
          :data="pools"
          :isLoading="isLoadingPools"
          skeletonClass="h-64"
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
          <template v-slot:stakeButtonCell>
            <div class="px-6 py-4 flex items-center">
              <bal-btn size="sm" color="blue">Stake</bal-btn>
            </div>
          </template>
        </bal-table>
      </div>
    </div>
    <!-- <BlockMyWallet v-if="account" :loading="loading" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import { fNum } from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import SubNav from '@/components/navs/SubNav.vue';
import useWeb3 from '@/composables/useWeb3';
import { useQuery } from 'vue-react-query';
import { isNil } from 'lodash';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

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

const columns = [
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
    accessor: pool => fNum(getPoolShare(pool), 'usd_lg'),
    className: 'cell',
    align: 'right'
  },
  {
    name: 'Pool Value',
    accessor: pool => fNum(pool.liquidity, 'usd_lg'),
    className: 'cell',
    align: 'right'
  },
  {
    name: 'Vol (24h)',
    accessor: pool => fNum(pool.volume, 'usd_lg'),
    className: 'cell',
    align: 'right'
  },
  {
    name: 'APY (1y)',
    accessor: pool => `${fNum(pool.apy, 'percent')} ✨`,
    className: 'cell',
    align: 'right'
  },
  {
    name: 'Staking',
    accessor: 'stake',
    Cell: 'stakeButtonCell',
    className: 'cell'
  }
];

export default defineComponent({
  components: {
    SubNav
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const { account, blockNumber, loading: isWeb3Loading } = useWeb3();

    // DATA
    const data = reactive({
      totalBalance: 0
    });
    const currentGraphingPeriod = ref(30);

    // COMPUTED
    const isLoading = computed(() => {
      return (
        store.state.web3.loading ||
        (store.state.account.loading && !store.state.account.loaded)
      );
    });
    const isAppLoading = computed(() => store.state.app.loading);
    const isPageLoading = computed(
      () => isAppLoading.value || isLoading.value || isWeb3Loading.value
    );
    const provider = computed(() => getProvider(networkKey.value));
    const networkKey = computed(() => store.state.web3.config.key);
    const tokens = computed(() => store.getters['registry/getTokens']());
    const {
      data: portfolioChartData,
      isLoading: isLoadingChartData
    } = useQuery<any, any>(
      ['chartData', networkKey.value, blockNumber.value, account.value],
      () =>
        getPoolSharesChart(
          networkKey.value,
          blockNumber.value,
          account.value,
          currentGraphingPeriod.value
        ),
      {
        enabled:
          !isNil(account) ||
          !isNil(networkKey.value) ||
          !isNil(account.value) ||
          !isPageLoading.value
      }
    );

    const { data: pools, isLoading: isLoadingPools } = useQuery(
      ['portfolioPools', networkKey.value, provider, account.value],
      () => getPoolsWithShares(networkKey.value, provider.value, account.value),
      {
        enabled:
          !isNil(networkKey.value) ||
          !isNil(provider.value) ||
          !isNil(account.value) ||
          !isPageLoading.value,
        onSuccess: async pools => {
          const tokens = pools
            .map(pool => pool.tokens)
            .reduce((a, b) => [...a, ...b], []);
          await injectTokens(tokens);
        }
      }
    );

    // METHODS
    const injectTokens = tokens =>
      store.dispatch('registry/injectTokens', tokens);

    const handleGraphingPeriodChange = (newPeriod: number) => {
      currentGraphingPeriod.value = newPeriod;
    };

    return {
      // data
      ...toRefs(data),
      pools,
      isLoadingPools,
      // computed
      account,
      isLoading,
      isWeb3Loading,
      isAppLoading,
      isPageLoading,
      tokens,
      // methods
      fNum,
      t,
      isLoadingChartData,
      portfolioChartData,
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
