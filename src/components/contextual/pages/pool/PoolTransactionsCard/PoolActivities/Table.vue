<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';
import { getAddress } from '@ethersproject/address';

import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

import {
  PoolActivity,
  PoolActivityType
} from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

import { bnum } from '@/lib/utils';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';

/**
 * TYPES
 */

type TokenAmount = {
  address: string;
  symbol: string;
  amount: string;
};

type ActivityRow = {
  label: string;
  formattedValue: string;
  value: number;
  timestamp: number;
  formattedDate: string;
  tx: string;
  type: PoolActivityType;
  tokenAmounts: TokenAmount[];
};

type Props = {
  tokens: string[];
  poolActivities: PoolActivity[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  loadMore?: () => void;
  isPaginated?: boolean;
  noResultsLabel?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isLoadingMore: false,
  isPaginated: false
});

const emit = defineEmits(['loadMore']);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { explorerLinks } = useWeb3();
const { tokens, priceFor } = useTokens();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const columns = computed<ColumnDefinition<ActivityRow>[]>(() => [
  {
    name: t('action'),
    id: 'action',
    accessor: 'tx',
    Cell: 'actionCell',
    width: 150,
    sortable: false
  },
  {
    name: t('details'),
    id: 'details',
    accessor: '',
    Cell: 'detailsCell',
    width: 325,
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
            value > 0
              ? fNum2(value, { style: 'currency', abbreviate: true })
              : '-',
          timestamp,
          formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
          tx,
          type,
          tokenAmounts: getJoinExitDetails(amounts)
        };
      })
);

/**
 * METHODS
 */
function getJoinExitValue(amounts: PoolActivity['amounts']) {
  let total = bnum(0);

  for (let i = 0; i < amounts.length; i++) {
    const amount = amounts[i];
    const address = getAddress(props.tokens[i]);
    const token = tokens.value[address];
    const price = priceFor(token.address);
    const amountNumber = Math.abs(parseFloat(amount));

    // If the price is unknown for any of the positive amounts - the value cannot be computed.
    if (amountNumber > 0 && price === 0) {
      return 0;
    }

    total = total.plus(bnum(amountNumber).times(price));
  }

  return total.toNumber();
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
      amount: fNum2(amountNumber, FNumFormats.token)
    };
  });
}
</script>

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
      @load-more="emit('loadMore')"
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
              :href="explorerLinks.txLink(action.tx)"
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
