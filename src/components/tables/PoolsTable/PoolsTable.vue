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
      :data="filteredData"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :on-row-click="handleRowClick"
      :is-paginated="filteredData.length < data.length"
      :sort-externally="true"
      @load-more="handleLoadMore"
      @handle-sort="handleSort"
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
        <div
          v-if="pool.hasUnstakedBpt"
          class="rounded-br-xl h-4 w-4 flex bg-yellow-500 absolute top-0 left-0 bg-opacity-80"
        />
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSetWithTooltip
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
            :pool="pool"
          />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <!--          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="isStableLike(pool.poolType)"
            :selectedTokens="selectedTokens"
          />-->

          <h5 class="text-left font-normal">
            {{ pool.name }}
          </h5>
          <BalChip
            v-if="pool.isNewPool"
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
            Number(pool.apr.swapApr) > 10000
              ? '-'
              : fNum(pool.apr.total, 'percent')
          }}
          <LiquidityAPRTooltip :pool="pool" />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  DecoratedPoolWithShares,
  PoolToken
} from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import BalAssetSetWithTooltip from '@/components/tooltips/BalAssetSetWithTooltip.vue';
import TokenPills from './TokenPills/TokenPills.vue';

import {
  BalTableColumnSortData,
  ColumnDefinition
} from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike, isStablePhantom } from '@/composables/usePool';
import useWeb3 from '@/services/web3/useWeb3';
import { sortBy } from 'lodash';

const POOLS_PER_PAGE = 10;

export default defineComponent({
  components: {
    LiquidityAPRTooltip,
    BalAssetSetWithTooltip
    //TokenPills
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
    const { fNum } = useNumbers();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { appNetworkConfig } = useWeb3();
    const numPoolsVisible = ref(POOLS_PER_PAGE);
    const sortData = ref<BalTableColumnSortData>({
      column: 'poolValue',
      direction: 'desc'
    });

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
        name: 'Pool',
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        width: 350
      },
      {
        name: t('myBalance'),
        accessor: pool =>
          fNum(pool.userBalance ?? '0', 'usd', { forcePreset: true }),
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares,
        sortKey: pool => Number(pool.userBalance || 0),
        width: 150
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(pool.totalLiquidity, 'usd'),
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
        accessor: pool => fNum(pool.volume24h, 'usd'),
        align: 'right',
        id: 'poolVolume',
        sortKey: pool => {
          const apr = Number(pool.volume24h);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 175,
        cellClassName: 'font-numeric'
      },
      {
        name: t('apr'),
        Cell: 'aprCell',
        accessor: pool => pool.apr.total,
        align: 'right',
        id: 'poolApr',
        sortKey: pool => {
          const apr = Number(pool.apr.total);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 150
      }
    ]);

    const filteredData = computed(() => {
      let data: any[] = props.data || [];

      const column = columns.value.find(
        column => column.id === sortData.value.column
      );

      if (column && column.sortKey) {
        data = sortBy(data, column.sortKey);

        if (sortData.value.direction === 'desc') {
          data = data.reverse();
        }
      }

      return data.slice(0, numPoolsVisible.value);
    });

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

    function handleSort(data: BalTableColumnSortData) {
      sortData.value = data;
    }

    function handleLoadMore() {
      numPoolsVisible.value = numPoolsVisible.value + POOLS_PER_PAGE;
    }

    return {
      // data
      columns,
      filteredData,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      handleRowClick,
      getAddress,
      fNum,
      orderedTokenAddressesFor,
      orderedPoolTokens,
      isStableLike,
      handleSort,
      handleLoadMore
    };
  }
});
</script>
