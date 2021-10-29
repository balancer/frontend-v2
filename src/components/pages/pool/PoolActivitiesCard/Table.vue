<template>
  <BalCard
    class="overflow-x-auto"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="activityRows"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      :is-paginated="isPaginated"
      @load-more="$emit('loadMore')"
      skeleton-class="h-64"
      sticky="both"
      :no-results-label="noResultsLabel"
      :initial-state="{
        sortColumn: 'timeAgo',
        sortDirection: 'desc'
      }"
    >
      <template v-slot:actionCell="action">
        <div class="px-6 py-2">
          <div class="flex items-center">
            <div class="flex center mr-3">
              <BalIcon
                v-if="action.type === 'Join'"
                name="plus"
                size="sm"
                class="text-green-500 dark:text-green-400"
              />
              <BalIcon v-else name="minus" size="sm" class="text-red-500" />
            </div>
            <div>{{ action.label }}</div>
          </div>
        </div>
      </template>

      <template v-slot:detailsCell="action">
        <div class="px-6 py-4 flex -mt-1 flex-wrap">
          <template v-for="(tokenAmount, i) in action.tokenAmounts" :key="i">
            <div
              class="m-1 flex items-center p-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              v-if="tokenAmount.amount !== '0'"
            >
              <BalAsset
                :address="tokenAmount.address"
                class="mr-2 flex-shrink-0"
              />
              <span class="font-numeric">{{ tokenAmount.amount }}</span>
            </div>
          </template>
        </div>
      </template>

      <template v-slot:valueCell="action">
        <div class="px-6 py-4 flex justify-end font-numeric">
          {{ action.formattedValue }}
        </div>
      </template>

      <template v-slot:timeCell="action">
        <div class="px-6 py-4">
          <div
            class="flex items-center justify-end wrap whitespace-nowrap text-right"
          >
            {{ action.formattedDate }}
            <BalLink
              :href="explorer.txLink(action.tx)"
              external
              class="ml-2 flex items-center"
            >
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="text-gray-500 hover:text-blue-500 transition-colors"
              />
            </BalLink>
          </div>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';
import {
  PoolActivity,
  PoolActivityType
} from '@/services/balancer/subgraph/types';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import { formatDistanceToNow } from 'date-fns';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import { bnum } from '@/lib/utils';

type TokenAmount = {
  address: string;
  symbol: string;
  amount: string;
};

interface ActivityRow {
  label: string;
  formattedValue: string;
  value: number;
  timestamp: number;
  formattedDate: string;
  tx: string;
  type: PoolActivityType;
  tokenAmounts: TokenAmount[];
}

export default {
  emits: ['loadMore'],

  props: {
    tokens: {
      type: Array as PropType<string[]>,
      required: true
    },
    poolActivities: {
      type: Array as PropType<PoolActivity[]>,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    loadMore: {
      type: Function as PropType<() => void>
    },
    isPaginated: {
      type: Boolean,
      default: false
    },
    noResultsLabel: {
      type: String
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { explorerLinks } = useWeb3();
    const { tokens, priceFor } = useTokens();
    const { upToLargeBreakpoint } = useBreakpoints();

    const columns = computed<ColumnDefinition<ActivityRow>[]>(() => [
      {
        name: t('action'),
        id: 'action',
        accessor: 'tx',
        Cell: 'actionCell',
        width: 175,
        sortable: false
      },
      {
        name: t('details'),
        id: 'details',
        accessor: '',
        Cell: 'detailsCell',
        width: 300,
        sortable: false
      },
      {
        name: t('value'),
        id: 'value',
        accessor: 'value',
        Cell: 'valueCell',
        align: 'right',
        className: 'align-center w-40',
        sortKey: pool => pool.value,
        width: 125
      },
      {
        name: t('time'),
        id: 'timeAgo',
        accessor: 'timestamp',
        Cell: 'timeCell',
        align: 'right',
        sortKey: pool => pool.timestamp,
        width: 200
      }
    ]);

    const activityRows = computed<ActivityRow[]>(() =>
      props.isLoading
        ? []
        : props.poolActivities.map(({ type, timestamp, tx, amounts }) => {
            const isJoin = type === 'Join';
            const value = getJoinExitValue(amounts);

            return {
              label: isJoin ? t('invest') : t('withdraw.label'),
              value,
              formattedValue:
                value > 0 ? fNum(fNum(value, 'usd'), 'usd_m') : '-',
              timestamp,
              formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
              tx,
              type,
              tokenAmounts: getJoinExitDetails(amounts)
            };
          })
    );

    function getJoinExitValue(amounts: PoolActivity['amounts']) {
      return amounts
        .reduce((total, amount, index) => {
          const address = getAddress(props.tokens[index]);
          const token = tokens.value[address];
          const price = priceFor(token.address);
          const amountNumber = bnum(Math.abs(parseFloat(amount)));

          return total.plus(amountNumber.times(price));
        }, bnum(0))
        .toNumber();
    }

    function getJoinExitDetails(amounts: PoolActivity['amounts']) {
      return amounts.map((amount, index) => {
        const address = getAddress(props.tokens[index]);
        const token = tokens.value[address];
        const symbol = token ? token.symbol : address;
        const amountNumber = parseFloat(amount);

        return {
          address,
          symbol,
          amount: fNum(amountNumber, 'token')
        };
      });
    }

    return {
      columns,
      activityRows,
      explorer: explorerLinks,
      fNum,
      upToLargeBreakpoint
    };
  }
};
</script>
