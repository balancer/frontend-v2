<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { formatDistanceToNow } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { PoolActivity, PoolActivityType } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

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
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
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
  isPaginated: false,
  noResultsLabel: '',
});

const emit = defineEmits(['loadMore']);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { explorerLinks } = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();
const { getToken, priceFor } = useTokens();
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
    sortable: false,
  },
  {
    name: t('value'),
    id: 'value',
    accessor: 'value',
    Cell: 'valueCell',
    align: 'right',
    className: 'align-center w-40',
    sortKey: pool => pool.value,
    width: 125,
  },
  {
    name: t('tokens'),
    id: 'details',
    accessor: '',
    Cell: 'detailsCell',
    width: 325,
    sortable: false,
  },
  {
    name: t('time'),
    id: 'timeAgo',
    accessor: 'timestamp',
    Cell: 'timeCell',
    align: 'right',
    sortKey: pool => pool.timestamp,
    width: 200,
  },
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
          tokenAmounts: getJoinExitDetails(amounts),
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
    const token = getToken(address);
    const price = priceFor(token?.address);
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
    const token = getToken(address);
    const symbol = token ? token.symbol : address;
    const amountNumber = parseFloat(amount);
    return {
      address,
      symbol,
      amount: fNum2(amountNumber, FNumFormats.token),
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
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      :isPaginated="isPaginated"
      skeletonClass="h-64"
      sticky="both"
      :noResultsLabel="noResultsLabel"
      :initialState="{
        sortColumn: 'timeAgo',
        sortDirection: 'desc',
      }"
      @load-more="emit('loadMore')"
    >
      <template #actionCell="action">
        <div class="py-2 px-6">
          <div class="flex items-center">
            <div class="flex mr-3 center">
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

      <template #detailsCell="action">
        <div class="flex flex-wrap py-4 px-6 -mt-1">
          <template v-for="(tokenAmount, i) in action.tokenAmounts" :key="i">
            <div
              v-if="tokenAmount.amount !== '0'"
              class="flex items-center p-1 px-2 m-1 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <BalAsset
                :address="tokenAmount.address"
                class="flex-shrink-0 mr-2"
              />
              <span class="font-numeric">{{ tokenAmount.amount }}</span>
            </div>
          </template>
        </div>
      </template>

      <template #valueCell="action">
        <div class="flex justify-end py-4 px-6 font-numeric">
          {{ action.formattedValue }}
        </div>
      </template>

      <template #timeCell="action">
        <div class="py-4 px-6">
          <div
            class="flex justify-end items-center text-right whitespace-nowrap wrap"
          >
            {{ action.formattedDate }}
            <BalLink
              :href="explorerLinks.txLink(action.tx)"
              external
              class="flex items-center ml-2"
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
