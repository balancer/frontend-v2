<template>
  <BalCard shadow="lg" class="mt-4" noPad>
    <BalTable
      sticky="both"
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      skeleton-class="h-64"
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
        <div class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
          />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        {{ console.log('steble', pool) }}
        <div class="px-6 py-4">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="pool.poolType === 'Stable'"
          />
        </div>
      </template>
      <template
        v-for="(week, i) in weeks"
        v-slot:[week.week]="pool"
        :key="week.week"
      >
        <div class="px-6 py-4 text-right flex flex-col">
          <span
            v-for="(tokenDist, tokenIndex) in pool.distributions[i]
              .distribution"
            :key="tokenDist.tokenAddress"
          >
            <span v-if="tokenIndex !== 0">+</span>&nbsp;
            {{ fNum(tokenDist.amount, 'token_lg') }}
            {{ tokens[getAddress(tokenDist.tokenAddress)]?.symbol || 'N/A' }}
          </span>
        </div>
      </template>
      <template
        v-for="week in weeks"
        v-slot:[`totals-${week.week}`]
        :key="week.week"
      >
        <div class="text-right flex flex-col">
          <span
            v-for="({ token, total }, i) in totals[week.week]"
            :key="`totals-${token}`"
            class="font-semibold text-right"
          >
            <span v-if="i !== 0">+</span>&nbsp;
            {{ fNum(total, 'token_lg') }}
            {{ tokens[getAddress(token)]?.symbol || 'N/A' }}
          </span>
          <span class="mt-2 text-gray-500"
            >~${{ fNum(calculatePricesFor(totals[week.week])) }}</span
          >
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import { WeeklyDistributions } from '@/pages/LiquidityMining.vue';
import TokenPills from '../PoolsTable/TokenPills/TokenPills.vue';
import {
  DecoratedPoolWithShares,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { sum } from 'lodash';
import { useStore } from 'vuex';

function getWeekName(week: string) {
  const parts = week.split('_');
  return `Week ${parts[1]}`;
}

type TokenTotal = { token: string; total: number };

export default defineComponent({
  components: {
    TokenPills
  },
  props: {
    weeks: {
      type: Object as PropType<WeeklyDistributions[]>,
      required: true
    },
    poolMetadata: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  setup(props) {
    const { t } = useI18n();
    const { weeks, poolMetadata } = toRefs(props);
    const { tokens } = useTokens();
    const { fNum } = useNumbers();
    const store = useStore();

    const prices = computed(() => store.state.market.prices);
    const data = computed(() => {
      if (!poolMetadata.value) return [];
      return poolMetadata.value[0].pools.map(pool => ({
        address: pool.address,
        tokens: pool.tokens,
        distributions: weeks.value.map(week => ({
          week: week.week,
          distribution: week.distributions[pool.id.toLowerCase()]
        })),
        poolType: pool.poolType
      }));
    });

    const columns = computed<ColumnDefinition[]>(() => {
      return [
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
        ...weeks.value.map(({ week }, i) => ({
          name: getWeekName(week),
          accessor: week,
          id: week,
          Cell: week,
          width: 135,
          align: 'right' as any,
          sortKey: pool => {
            return sum(
              (pool.distributions[i].distribution || []).map(d => d.amount)
            );
          },
          totalsCell: `totals-${week}`
        }))
      ];
    });

    const totals = computed(() => {
      // map tracking a list of token totals for each week
      const weeklyTotals: Record<string, TokenTotal[]> = {};
      for (const week of weeks.value) {
        // map tracking totals for each token
        const tokenTotals: Record<string, TokenTotal> = {};
        // this will be an array of pools with their token distributions,
        // we just want the values, not the pool id
        const distributions = Object.values(week.distributions);
        for (const distribution of distributions) {
          for (const allocation of distribution) {
            if (!tokenTotals[allocation.tokenAddress]) {
              tokenTotals[allocation.tokenAddress] = {
                token: allocation.tokenAddress,
                total: allocation.amount
              };
              continue;
            } else {
              tokenTotals[allocation.tokenAddress].total =
                tokenTotals[allocation.tokenAddress].total + allocation.amount;
            }
          }
        }
        weeklyTotals[week.week] = Object.values(tokenTotals);
      }
      return weeklyTotals;
    });

    function orderedPoolTokens(pool: DecoratedPoolWithShares): PoolToken[] {
      if (pool.poolType === 'Stable') return pool.tokens;

      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      return sortedTokens;
    }

    function orderedTokenAddressesFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = orderedPoolTokens(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function calculatePricesFor(totals: TokenTotal[]) {
      let totalUsd = 0;
      for (const total of totals) {
        const usdValue =
          prices.value[total.token.toLowerCase()].price * total.total;
        totalUsd = totalUsd + usdValue;
      }
      return totalUsd;
    }

    return {
      columns,
      data,
      orderedTokenAddressesFor,
      orderedPoolTokens,
      fNum,
      getAddress,
      totals,
      tokens,
      prices,
      calculatePricesFor,
      console
    };
  }
});
</script>
