@@ -0,0 +1,360 @@
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
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSetWithTooltip
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
            :pool="pool"
          />
        </div>
      </template>
      <template v-slot:variance="pool">
        <div
          :class="
            calculatePoolVariance(pool).isEqualTo(0)
              ? 'text-green-500'
              : 'text-red-500'
          "
          class="px-6 py-4 -mt-1 flex justify-end font-numeric "
        >
          {{
            calculatePoolVariance(pool).isEqualTo(0)
              ? 'in range'
              : fNum(calculatePoolVariance(pool).toString(), null, {
                  format: '+0,0'
                })
          }}
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { LinearPool, PoolToken } from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';

import BalAssetSetWithTooltip from '@/components/tooltips/BalAssetSetWithTooltip.vue';

import {
  BalTableColumnSortData,
  ColumnDefinition
} from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike, isStablePhantom } from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { sortBy } from 'lodash';

const POOLS_PER_PAGE = 10;

export default defineComponent({
  components: { BalAssetSetWithTooltip },

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
    const numPoolsVisible = ref(POOLS_PER_PAGE);
    const sortData = ref<BalTableColumnSortData>({
      column: 'poolValue',
      direction: 'desc'
    });

    // DATA
    const columns = ref<ColumnDefinition<LinearPool>[]>([
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
        accessor: pool => pool.name,
        id: 'poolName',
        width: 300,
        cellClassName: 'font-numeric'
      },
      {
        name: 'Variance',
        accessor: 'variance',
        sortKey: pool =>
          calculatePoolVariance(pool)
            .abs()
            .toNumber(),
        align: 'right',
        id: 'variance',
        Cell: 'variance',
        width: 120
      },
      {
        name: 'Main Token',
        accessor: pool =>
          fNum(getMainTokenBalance(pool).toString(), 'token_lg'),
        sortKey: pool => bnum(getMainTokenBalance(pool)).toNumber(),
        align: 'right',
        id: 'mainTokenBalance',
        width: 150,
        cellClassName: 'font-numeric'
      },
      {
        name: 'Wrapped Token',
        accessor: pool =>
          fNum(getWrappedTokenBalance(pool).toString(), 'token_lg'),
        sortKey: pool => bnum(getWrappedTokenBalance(pool)).toNumber(),
        align: 'right',
        id: 'wrappedTokenBalance',
        width: 150,
        cellClassName: 'font-numeric'
      },
      {
        name: 'Boost',
        accessor: pool =>
          fNum(calculateBoostPercent(pool).toString(), 'percent_lg'),
        sortKey: pool => calculateBoostPercent(pool).toNumber(),
        align: 'right',
        id: 'percentBoost',
        width: 100,
        cellClassName: 'font-numeric'
      },
      {
        name: 'Lower Target',
        accessor: pool => fNum(pool.lowerTarget, 'default'),
        sortKey: pool => bnum(pool.lowerTarget).toNumber(),
        align: 'right',
        id: 'lowerTarget',
        width: 140,
        cellClassName: 'font-numeric'
      },
      {
        name: 'Upper Target',
        accessor: pool => fNum(pool.upperTarget, 'default'),
        sortKey: pool => bnum(pool.upperTarget).toNumber(),
        align: 'right',
        id: 'upperTarget',
        width: 140,
        cellClassName: 'font-numeric'
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(calculatePoolValue(pool).toString(), 'usd'),
        sortKey: pool => calculatePoolValue(pool).toNumber(),
        align: 'right',
        id: 'poolValue',
        width: 150,
        cellClassName: 'font-numeric'
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
    function calculatePoolValue(pool: LinearPool) {
      const linearPool = pool.linearPools?.find(
        lp => lp.address === pool.address.toLowerCase()
      );
      return linearPool
        ? bnum(linearPool.totalSupply).times(linearPool.priceRate)
        : bnum(0);
    }

    function getMainTokenBalance(pool: LinearPool) {
      return bnum(pool.tokens[pool.mainIndex].balance);
    }

    function getWrappedTokenBalance(pool: LinearPool) {
      return bnum(pool.tokens[pool.wrappedIndex].balance).multipliedBy(
        pool.tokens[pool.wrappedIndex].priceRate || 0
      );
    }

    function calculateBoostPercent(pool: LinearPool) {
      const percentBoosted = getWrappedTokenBalance(pool).dividedBy(
        getMainTokenBalance(pool).plus(getWrappedTokenBalance(pool))
      );
      return percentBoosted;
    }

    function calculatePoolVariance(pool: LinearPool) {
      const lowerTarget = bnum(pool.lowerTarget);
      const upperTarget = bnum(pool.upperTarget);
      const mainTokenBalance = getMainTokenBalance(pool);

      let belowAboveValue = bnum(0);
      if (mainTokenBalance.comparedTo(lowerTarget) === -1) {
        // below target
        belowAboveValue = mainTokenBalance.minus(lowerTarget);
      } else if (mainTokenBalance.comparedTo(upperTarget) === 1) {
        // above target
        belowAboveValue = mainTokenBalance.minus(upperTarget);
      }
      return belowAboveValue;
    }

    function orderedTokenAddressesFor(pool: LinearPool) {
      const sortedTokens = orderedPoolTokens(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function orderedPoolTokens(pool: LinearPool): PoolToken[] {
      if (isStablePhantom(pool.poolType))
        return pool.tokens.filter(token => token.address !== pool.address);
      if (isStableLike(pool.poolType)) return pool.tokens;

      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort(
        (a, b) => parseFloat(b.balance) - parseFloat(a.balance)
      );
      return sortedTokens;
    }

    function handleRowClick(pool: LinearPool) {
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
      handleLoadMore,
      calculatePoolVariance
    };
  }
});
</script>
