<template>
  <BalCard shadow="lg" class="mt-4" noPad>
    <BalTable
      sticky="both"
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      skeleton-class="h-64"
      :link="{
        to: 'pool',
        getParams: pool => ({ id: pool.id })
      }"
      :initial-state="{ sortDirection: 'desc', sortColumn: latestWeek }"
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
      <template
        v-for="(week, i) in weeks"
        v-slot:[`header-${week.week}`]
        :key="week.week"
      >
        <div class="text-right flex flex-col">
          <span>{{ getWeekName(week.week) }}</span>
          <span class="text-xs"
            >Starts {{ getWeekStart(weeks.length - i - 1) }}</span
          >
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
        <div class="px-6 py-4 items-center">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="isStableLike(pool.poolType)"
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
      <template
        v-for="(week, i) in weeks"
        v-slot:[week.week]="pool"
        :key="week.week"
      >
        <div
          class="px-6 py-4 text-right flex flex-col"
          v-if="pool.distributions[i].distribution"
        >
          <span
            v-for="(tokenDist, tokenIndex) in pool.distributions[i]
              .distribution"
            :key="tokenDist.tokenAddress"
          >
            <span v-if="tokenIndex !== 0">+</span>&nbsp;
            <span class="font-numeric">{{
              fNum(tokenDist.amount, 'token_lg')
            }}</span>
            {{ tokens[getAddress(tokenDist.tokenAddress)]?.symbol || 'N/A' }}
          </span>
        </div>
        <div class="px-6 py-4 text-right flex flex-col" v-else>
          -
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
            <span class="font-numeric">{{ fNum(total, 'token_lg') }}</span>
            {{ tokens[getAddress(token)]?.symbol || 'N/A' }}
          </span>
          <span class="mt-2 text-gray-500 font-numeric"
            >~${{ fNum(calculatePricesFor(totals[week.week])) }}</span
          >
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import { TokenTotal, WeeklyDistributions } from '@/pages/LiquidityMining.vue';
import TokenPills from '../PoolsTable/TokenPills/TokenPills.vue';
import {
  DecoratedPoolWithShares,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import { computed, defineComponent, PropType, Ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { last, sum } from 'lodash';
import useDarkMode from '@/composables/useDarkMode';
import { isStableLike } from '@/composables/usePool';
import { startOfWeek, subWeeks, format, addDays } from 'date-fns';

function getWeekName(week: string) {
  const parts = week.split('_');
  return `Week ${parts[1]}`;
}

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
      type: Object
    },
    isLoading: {
      type: Boolean
    },
    totals: {
      type: Object as PropType<Ref<Record<string, TokenTotal[]>>>,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n();
    const { weeks, poolMetadata } = toRefs(props);
    const { tokens, priceFor } = useTokens();
    const { fNum } = useNumbers();
    const { darkMode } = useDarkMode();

    const data = computed(() => {
      if (!poolMetadata.value) return [];
      return poolMetadata.value[0].pools.map(pool => ({
        address: pool.address,
        tokens: pool.tokens,
        distributions: weeks.value.map(week => ({
          week: week.week,
          distribution: week.distributions[pool.id.toLowerCase()]
        })),
        poolType: pool.poolType,
        id: pool.id
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
          Header: `header-${week}`,
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

    const latestWeek = computed(() => last(weeks.value)?.week);

    function orderedPoolTokens(pool: DecoratedPoolWithShares): PoolToken[] {
      if (isStableLike(pool.poolType)) return pool.tokens;

      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      return sortedTokens;
    }

    function orderedTokenAddressesFor(pool: DecoratedPoolWithShares) {
      const sortedTokens = orderedPoolTokens(pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function calculatePricesFor(totals: TokenTotal[]) {
      let totalFiat = 0;
      for (const total of totals) {
        const usdValue = priceFor(getAddress(total.token)) * total.total;
        totalFiat = totalFiat + usdValue;
      }
      return totalFiat;
    }

    function getWeekStart(howManyWeeksToSubtract: number) {
      return format(
        // startOfWeek is Sunday for date-fns
        addDays(startOfWeek(subWeeks(new Date(), howManyWeeksToSubtract)), 1),
        'dd/MM/yyyy'
      );
    }

    return {
      orderedTokenAddressesFor,
      orderedPoolTokens,
      fNum,
      getAddress,
      calculatePricesFor,
      isStableLike,
      getWeekName,
      columns,
      data,
      tokens,
      priceFor,
      darkMode,
      latestWeek,
      getWeekStart
    };
  }
});
</script>
