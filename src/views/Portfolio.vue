<template>
  <div class="container px-4 mx-auto">
    <SubNav class="mb-8" />
    <div class="mt-16">
      <BalLineChart
        :isLoading="isLoadingChartData || isAppLoading"
        name="Value ($)"
        :axis="portfolioChartData?.axis"
        :data="portfolioChartData?.data"
        :onPeriodSelected="handleGraphingPeriodChange"
        :currentGraphingPeriod="currentGraphingPeriod"
      />
    </div>
    <div>
      <h3
        v-text="$t('myV2Investments')"
        class="text-gray-800 font-semibold text-xl tracking-wide mt-8"
      />
      <BalCard shadow="lg" class="mt-8" no-pad>
        <BalTable
          :columns="columns"
          :data="pools"
          :isLoading="isLoadingPools || isAppLoading || isInjectingTokens"
          skeletonClass="h-64"
          sticky="both"
          :onRowClick="
            pool => {
              router.push({ name: 'pool', params: { id: pool.id } });
            }
          "
        >
          <template v-slot:iconColumnHeader>
            <div class="flex items-center">
              <img :src="require('@/assets/icons/token_header.svg')" />
            </div>
          </template>
          <template v-slot:iconColumnCell="pool">
            <div class="px-6 py-8 grid grid-cols-3">
              <div
                v-for="(token, i) in tokensFor(pool)"
                :key="token"
                class="z-10 absolute"
                :style="{
                  left: `${getIconPosition(i, pool.tokens.length)}px`
                }"
              >
                <BalAsset :address="token" />
              </div>
            </div>
          </template>
          <template v-slot:poolNameCell="pool">
            <div class="px-6 py-8">
              <span
                v-for="token in pool.tokens"
                :key="token"
                class="inline-block mr-1"
              >
                <span class="dot">•</span>
                {{ fNum(token.weight, 'percent') }}
                {{
                  allTokens[token.address]
                    ? allTokens[token.address].symbol
                    : ''
                }}
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
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    SubNav
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const router = useRouter();
    const {
      account,
      blockNumber,
      loading: isWeb3Loading,
      userNetwork
    } = useWeb3();
    const { fNum } = useNumbers();
    const { allTokens } = useTokens();

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
        name: t('poolName'),
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        className: 'w-full'
      },
      {
        name: t('myBalance'),
        accessor: pool => fNum(getPoolShare(pool), 'usd', null, true),
        className: 'cell',
        align: 'right',
        id: 'myBalance'
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(pool.liquidity, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolValue'
      },
      {
        name: t('volume24h', [t('hourAbbrev')]),
        accessor: pool => fNum(pool.volume, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolVolume'
      },
      {
        name: t('apy', [t('yearAbbrev')]),
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
    const prices = computed(() => store.state.market.prices);

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
      () => getPoolsWithShares(networkKey.value, account.value, prices.value),
      reactive({
        enabled: areQueriesEnabled,
        onSuccess: async pools => {
          const tokens = pools
            .map(pool => pool.tokens.map(t => t.address))
            .reduce((a, b) => [...a, ...b], []);
          await injectTokens(tokens);
          isInjectingTokens.value = false;
        }
      })
    );

    // METHODS
    const getPoolShare = pool => {
      if (!pool.shares) return 0;
      return (pool.liquidity / parseFloat(pool.totalShares)) * pool.shares;
    };

    function tokensFor(pool) {
      return pool.tokens.map(token => getAddress(token.address));
    }

    const injectTokens = tokens =>
      store.dispatch('registry/injectTokens', tokens);

    const handleGraphingPeriodChange = (newPeriod: number) => {
      currentGraphingPeriod.value = newPeriod;
    };

    function getIconPosition(i: number, count: number) {
      if (count < 3) {
        return 28 * i + 24;
      }
      if (count === 3) {
        return 24 * i + 24;
      }
      return (48 * i) / (count - 1) + 24;
    }

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
      allTokens,
      isLoadingChartData,
      portfolioChartData,
      isFetchingMoreChartData,
      isInjectingTokens,
      currentGraphingPeriod,
      // methods
      fNum,
      t,
      columns,
      handleGraphingPeriodChange,
      tokensFor,
      getAddress,
      router,
      getIconPosition
    };
  }
});
</script>

<style>
.cell {
  min-width: 8rem;
}

.dot {
  color: #44d7b6;
}
</style>
