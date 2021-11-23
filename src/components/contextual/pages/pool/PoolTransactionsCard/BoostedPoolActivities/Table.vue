<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';
import { groupBy } from 'lodash';

import useWeb3 from '@/services/web3/useWeb3';
import { FullPool, PoolSwap } from '@/services/balancer/subgraph/types';

import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';

import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type TokenAmount = {
  address: string;
  amount: string;
};

type SwapType = 'invest' | 'withdraw' | 'trade';

type SwapRow = {
  label: string;
  timestamp: number;
  formattedDate: string;
  value: number;
  formattedValue: string;
  type: SwapType;
  tx: string;
  tokenAmounts: TokenAmount[];
};

type Props = {
  tokens: string[];
  poolSwaps: PoolSwap[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  loadMore?: () => void;
  isPaginated?: boolean;
  noResultsLabel?: string;
  poolAddress: string;
  pool: FullPool;
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
const { fNum } = useNumbers();
const { t } = useI18n();
const { priceFor } = useTokens();
const { upToLargeBreakpoint } = useBreakpoints();
const { explorerLinks } = useWeb3();

/**
 * COMPUTED
 */
const columns = computed<ColumnDefinition<SwapRow>[]>(() => [
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

const swapRows = computed<SwapRow[]>(() => {
  if (props.isLoading) {
    return [];
  }

  const groupedSwaps = Object.entries(groupBy(props.poolSwaps, 'tx'));

  return groupedSwaps.map(([tx, swaps]) => {
    const { tokenIn, tokenOut, timestamp } = swaps[0];

    let type: SwapType;
    let label: string;

    if (tokenOut === props.pool.address) {
      type = 'invest';
      label = t('invest');
    } else if (tokenIn === props.pool.address) {
      type = 'withdraw';
      label = t('withdraw.label');
    } else {
      type = 'trade';
      label = t('trade');
    }

    const tokenAmounts = getTokenAmounts(swaps, type);
    const value = getTransactionValue(tokenAmounts, type);

    return {
      label,
      type,
      value,
      formattedValue: value > 0 ? fNum(fNum(value, 'usd'), 'usd_m') : '-',
      timestamp,
      formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
      tx,
      tokenAmounts
    };
  });
});

/**
 * METHODS
 */
function getTransactionValue(tokenAmounts: TokenAmount[], type: SwapType) {
  if (type === 'trade') {
    return bnum(priceFor(tokenAmounts[1].address))
      .times(tokenAmounts[1].amount)
      .toNumber();
  }

  let total = bnum(0);

  for (const { address, amount } of tokenAmounts) {
    const price = priceFor(address);
    const amountNumber = Math.abs(parseFloat(amount));

    // If the price is unknown for any of the positive amounts - the value cannot be computed.
    if (amountNumber > 0 && price === 0) {
      return 0;
    }

    total = total.plus(bnum(amountNumber).times(price));
  }

  return total.toNumber();
}

function getTokenAmounts(swaps: PoolSwap[], type: SwapType) {
  const isInvest = type === 'invest';

  if (type === 'trade') {
    const swap = swaps[0];
    const { tokenIn, tokenOut, tokenAmountIn, tokenAmountOut } = swap;

    return [
      {
        address: getUnderlyingTokenAddress(tokenIn),
        amount: tokenAmountIn
      },
      {
        address: getUnderlyingTokenAddress(tokenOut),
        amount: tokenAmountOut
      }
    ];
  }
  return swaps.map(swap => {
    let address = isInvest ? swap.tokenIn : swap.tokenOut;

    address = isInvest
      ? getUnderlyingTokenAddress(swap.tokenIn)
      : getUnderlyingTokenAddress(swap.tokenOut);

    return {
      address,
      amount: isInvest ? swap.tokenAmountIn : swap.tokenAmountOut
    };
  });
}

function getUnderlyingTokenAddress(address: string) {
  const { linearPools } = props.pool.onchain;

  return linearPools != null && linearPools[address] != null
    ? linearPools[address].mainToken.address
    : address;
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
      :data="swapRows"
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
                v-if="action.type === 'invest'"
                name="plus"
                size="sm"
                class="text-green-500 dark:text-green-400"
              />
              <BalIcon
                v-else-if="action.type === 'withdraw'"
                name="minus"
                size="sm"
                class="text-red-500"
              />
              <BalIcon
                v-else
                name="repeat"
                size="sm"
                class="text-green-500 dark:text-green-400"
              />
            </div>
            <div>{{ action.label }}</div>
          </div>
        </div>
      </template>

      <template v-slot:detailsCell="action">
        <div class="px-6 py-4 flex -mt-1 flex-wrap items-center">
          <template v-if="action.type === 'trade'">
            <div class="token-item">
              <BalAsset
                :address="action.tokenAmounts[0].address"
                class="mr-2 flex-shrink-0"
              />
              <span class="font-numeric">{{
                fNum(action.tokenAmounts[0].amount, 'token')
              }}</span>
            </div>
            <BalIcon name="arrow-right" class="mx-1" />
            <div class="token-item">
              <BalAsset
                :address="action.tokenAmounts[1].address"
                class="mr-2 flex-shrink-0"
              />
              <span class="font-numeric">{{
                fNum(action.tokenAmounts[1].amount, 'token')
              }}</span>
            </div>
          </template>
          <template v-else>
            <template v-for="(tokenAmount, i) in action.tokenAmounts" :key="i">
              <div
                class="m-1 flex items-center p-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                v-if="tokenAmount.amount !== '0'"
              >
                <BalAsset
                  :address="tokenAmount.address"
                  class="mr-2 flex-shrink-0"
                />
                <span class="font-numeric">{{
                  fNum(tokenAmount.amount, 'token')
                }}</span>
              </div>
            </template>
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

<style scoped>
.token-item {
  @apply m-1 flex items-center p-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg;
}
</style>
