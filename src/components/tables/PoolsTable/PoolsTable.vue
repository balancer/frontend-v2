<template>
  <BalCard shadow="lg" class="mt-4" no-pad>
    <BalTable
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :link="{
        to: 'pool',
        getParams: pool => ({ id: pool.id })
      }"
      :on-row-click="handleRowClick"
      :is-paginated="isPaginated"
      @load-more="$emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
        sortDirection: 'desc'
      }"
    >
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:iconColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
          />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div v-if="!isLoading && !isLoadingBalances" class="px-6 py-4">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="pool.poolType === 'Stable'"
          />
        </div>
      </template>
      <template v-slot:aprCell="pool">
        <div class="px-6 py-4 -mt-1 flex justify-end">
          {{
            Number(pool.dynamic.apr.pool) > 10000
              ? '-'
              : fNum(pool.dynamic.apr.total, 'percent')
          }}
          <LiquidityMiningTooltip :pool="pool" />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  DecoratedPoolWithShares,
  PoolToken
} from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';
import useAccountBalances from '@/composables/useAccountBalances';

import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import TokenPills from './TokenPills/TokenPills.vue';

import useTokens from '@/composables/useTokens';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';

export default defineComponent({
  components: {
    LiquidityMiningTooltip,
    TokenPills
  },

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
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { tokens } = useTokens();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const {
      balances,
      hasBalance,
      isLoading: isLoadingBalances,
      isIdle: isBalancesQueryIdle
    } = useAccountBalances();
    const { darkMode } = useDarkMode();

    // DATA
    const columns = ref<ColumnDefinition<DecoratedPoolWithShares>[]>([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        width: 125,
        noGrow: true
      },
      {
        name: t('composition'),
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        width: 350
      },
      {
        name: t('myBalance'),
        accessor: pool => fNum(pool.shares, 'usd', { forcePreset: true }),
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares,
        sortKey: pool => Number(pool.shares),
        width: 150
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(pool.totalLiquidity, 'usd'),
        align: 'right',
        id: 'poolValue',
        sortKey: pool => Number(pool.totalLiquidity),
        width: 150
      },
      {
        name: t('volume24h', [t('hourAbbrev')]),
        accessor: pool => fNum(pool.dynamic.volume, 'usd'),
        align: 'right',
        id: 'poolVolume',
        sortKey: pool => Number(pool.dynamic.volume),
        width: 175
      },
      {
        name: t('apr'),
        Cell: 'aprCell',
        accessor: pool => pool.dynamic.apr.total,
        align: 'right',
        id: 'poolApr',
        sortKey: pool => Number(pool.dynamic.apr.total),
        width: 150
      }
    ]);

    // METHODS
    function orderedTokenAddressesFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = orderedPoolTokens(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function orderedPoolTokens(pool: DecoratedPoolWithShares): PoolToken[] {
      if (pool.poolType === 'Stable') return pool.tokens;

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
      tokens,
      balances,
      isLoadingBalances,
      isBalancesQueryIdle,

      // computed
      darkMode,

      // methods
      handleRowClick,
      getAddress,
      fNum,
      orderedTokenAddressesFor,
      orderedPoolTokens,
      hasBalance
    };
  }
});
</script>
