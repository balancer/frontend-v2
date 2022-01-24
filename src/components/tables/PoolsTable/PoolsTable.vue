<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
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
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="isStableLike(pool.poolType)"
            :selectedTokens="selectedTokens"
          />
          <BalChip
            v-if="pool.dynamic.isNewPool"
            color="red"
            size="sm"
            class="ml-2 uppercase"
            :outline="false"
          >
            {{ $t('new') }}
          </BalChip>
        </div>
      </template>
      <template v-slot:aprCell="pool">
        <div class="px-6 py-4 -mt-1 flex justify-end font-numeric">
          {{
            Number(pool.dynamic.apr.pool) > 10000
              ? '-'
              : fNum2(pool.dynamic.apr.total, FNumFormats.percent)
          }}
          <LiquidityAPRTooltip :pool="pool" />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  DecoratedPoolWithShares,
  PoolToken
} from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import TokenPills from './TokenPills/TokenPills.vue';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike, isStablePhantom } from '@/composables/usePool';

export default defineComponent({
  components: {
    LiquidityAPRTooltip,
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
    },
    selectedTokens: {
      type: Array as PropType<string[]>
    }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum2 } = useNumbers();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();

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
        accessor: pool =>
          fNum2(pool.shares, { style: 'currency', fixedFormat: true }),
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares,
        sortKey: pool => Number(pool.shares),
        width: 150,
        cellClassName: 'font-numeric'
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum2(pool.totalLiquidity, FNumFormats.fiat),
        align: 'right',
        id: 'poolValue',
        sortKey: pool => {
          const apr = Number(pool.totalLiquidity);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 150,
        cellClassName: 'font-numeric'
      },
      {
        name: t('volume24h', [t('hourAbbrev')]),
        accessor: pool => fNum2(pool.dynamic.volume, FNumFormats.fiat),
        align: 'right',
        id: 'poolVolume',
        sortKey: pool => {
          const apr = Number(pool.dynamic.volume);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 175,
        cellClassName: 'font-numeric'
      },
      {
        name: t('apr'),
        Cell: 'aprCell',
        accessor: pool => pool.dynamic.apr.total,
        align: 'right',
        id: 'poolApr',
        sortKey: pool => {
          const apr = Number(pool.dynamic.apr.total);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 150
      }
    ]);

    // METHODS
    function orderedTokenAddressesFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = orderedPoolTokens(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function orderedPoolTokens(pool: DecoratedPoolWithShares): PoolToken[] {
      if (isStablePhantom(pool.poolType))
        return pool.tokens.filter(token => token.address !== pool.address);
      if (isStableLike(pool.poolType)) return pool.tokens;

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
      FNumFormats,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      handleRowClick,
      getAddress,
      fNum2,
      orderedTokenAddressesFor,
      orderedPoolTokens,
      isStableLike
    };
  }
});
</script>
