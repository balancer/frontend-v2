<template>
  <div class="container mx-auto px-4 lg:px-0">
    <SubNav class="mb-8" />
    <h3 class="mb-4">{{ $t('investmentPools') }}</h3>
    <TokenSearchInput
      v-model="selectedTokens"
      :loading="isLoadingPools || isWaitingForPoolsQuery"
    />
    <BalCard shadow="lg" class="mt-8" no-pad>
      <BalTable
        :columns="columns"
        :data="pools"
        :isLoading="isLoadingPools || isWaitingForPoolsQuery"
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
          <div class="px-6 py-8 flex flex-row icon">
            <div v-for="token in tokensFor(pool)" :key="token">
              <Token :token="allTokens[token]" />
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
              {{ token.weight * 100 }}
              {{ allTokens[getAddress(token.address)].symbol }}
            </span>
          </div>
        </template>
      </BalTable>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import SubNav from '@/components/navs/SubNav.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import { useQuery } from 'vue-query';
import useWeb3 from '@/composables/useWeb3';
import { getPoolsWithVolume } from '@/utils/balancer/pools';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { useRouter } from 'vue-router';
import { isEmpty } from 'lodash';

export default defineComponent({
  components: {
    SubNav,
    TokenSearchInput
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { userNetwork } = useWeb3();
    const prices = computed(() => store.state.market.prices);
    const { fNum } = useNumbers();
    const { allTokens } = useTokens();
    const router = useRouter();

    // DATA
    const selectedTokens = ref<string[]>([]);
    const poolData = computed(() => store.state.pools.all);
    const shouldLoadPools = computed(() => !isEmpty(prices.value));

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
    ]);

    function tokensFor(pool) {
      return pool.tokens.map(token => getAddress(token.address));
    }

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
      columns,
      allTokens,
      isWaitingForPoolsQuery,

      //methods
      tokensFor,
      getAddress,
      router
    };
  }
});
</script>
