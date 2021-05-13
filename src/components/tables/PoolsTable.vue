<template>
  <BalCard shadow="lg" class="mt-4" no-pad>
    <BalTable
      :columns="columns"
      :data="data"
      :isLoading="isLoading || isLoadingBalances"
      :isLoadingMore="isLoadingMore"
      skeletonClass="h-64"
      sticky="both"
      :onRowClick="handleRowClick"
      :isPaginated="isPaginated"
      @loadMore="$emit('loadMore')"
    >
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img :src="require('@/assets/icons/token_header.svg')" />
        </div>
      </template>
      <template v-slot:iconColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet
            :addresses="sortedTokenAddressesFor(pool)"
            :width="100"
          />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div
          v-if="!isLoading && !isLoadingBalances"
          class="px-6 py-4 -mt-1 flex flex-wrap"
        >
          <div
            v-for="token in sortedTokensFor(pool)"
            :key="token"
            class="mr-2 mb-2 flex items-center py-1 px-2 rounded-lg bg-gray-50 relative"
          >
            <div
              v-if="hasBalance(token.address)"
              class="w-3 h-3 rounded-full border-2 border-white hover:border-gray-50 bg-green-200 absolute top-0 left-0 -mt-1 -ml-1"
            />
            <span>
              {{ allTokens[getAddress(token.address)]?.symbol }}
            </span>
            <span class="font-medium text-gray-400 text-xs mt-px ml-1">
              {{ fNum(token.weight, 'percent_lg') }}
            </span>
          </div>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useFathom from '@/composables/useFathom';

import { ColumnDefinition } from '../_global/BalTable/BalTable.vue';
import useAccountBalances from '@/composables/useAccountBalances';

export default defineComponent({
  emits: ['loadMore'],

  props: {
    data: {
      type: Array
    },
    isLoading: {
      type: Boolean
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    showPoolShares: {
      type: Boolean,
      default: false
    },
    noPoolsLabel: {
      type: String,
      default: 'No pools'
    },
    isPaginated: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { allTokens } = useTokens();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const {
      balances,
      hasBalance,
      isLoading: isLoadingBalances,
      isIdle: isBalancesQueryIdle
    } = useAccountBalances();

    // COMPOSABLES
    const columns = ref<ColumnDefinition<DecoratedPoolWithShares>[]>([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        className: 'w-32 md:w-36 lg:w-40',
        noGrow: true
      },
      {
        name: t('composition'),
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        className: 'w-72'
      },
      {
        name: t('myBalance'),
        accessor: pool => fNum(pool.shares, 'usd', { forcePreset: true }),
        className: 'w-32',
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares,
        sortKey: pool => Number(pool.shares)
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(pool.totalLiquidity, 'usd'),
        className: 'w-32',
        align: 'right',
        id: 'poolValue',
        sortKey: pool => Number(pool.totalLiquidity)
      },
      {
        name: t('volume24h', [t('hourAbbrev')]),
        accessor: pool => fNum(pool.dynamic.volume, 'usd'),
        className: 'w-32',
        align: 'right',
        id: 'poolVolume',
        sortKey: pool => Number(pool.dynamic.volume)
      },
      {
        name: t('apy'),
        accessor: pool =>
          `${
            Number(pool.dynamic.apy) > 10000
              ? '-'
              : fNum(pool.dynamic.apy, 'percent')
          }`,
        className: 'w-32',
        align: 'right',
        id: 'poolApy',
        sortKey: pool => Number(pool.dynamic.apy)
      }
    ]);

    function sortedTokenAddressesFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = sortedTokensFor(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function sortedTokensFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      return sortedTokens;
    }

    function handleRowClick(pool: DecoratedPoolWithShares) {
      trackGoal(Goals.ClickPoolsTableRow);
      router.push({ name: 'pool', params: { id: pool.id } });
    }

    return {
      // data
      columns,
      allTokens,
      balances,
      isLoadingBalances,
      isBalancesQueryIdle,

      // methods
      handleRowClick,
      getAddress,
      fNum,
      sortedTokenAddressesFor,
      sortedTokensFor,
      hasBalance
    };
  }
});
</script>
