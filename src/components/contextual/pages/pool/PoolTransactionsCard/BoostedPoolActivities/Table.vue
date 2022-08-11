<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { groupBy } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool, PoolSwap } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

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
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  loadMore?: () => void;
  isPaginated?: boolean;
  noResultsLabel?: string;
  pool: Pool;
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
    sortable: false,
  },
  {
    name: t('details'),
    id: 'details',
    accessor: '',
    Cell: 'detailsCell',
    width: 325,
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
    name: t('time'),
    id: 'timeAgo',
    accessor: 'timestamp',
    Cell: 'timeCell',
    align: 'right',
    sortKey: pool => pool.timestamp,
    width: 200,
  },
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
      formattedValue:
        value > 0 ? fNum2(value, { style: 'currency', abbreviate: true }) : '-',
      timestamp,
      formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
      tx,
      tokenAmounts,
    };
  });
});

/**
 * METHODS
 */
function getTransactionValue(tokenAmounts: TokenAmount[], type: SwapType) {
  if (type === 'trade') {
    const mainTokenAddress = getUnderlyingTokenAddress(tokenAmounts[1].address);
    const mainEquivAmount = getMainTokenEquivalentAmount(
      tokenAmounts[1].address,
      tokenAmounts[1].amount
    );
    return bnum(priceFor(mainTokenAddress)).times(mainEquivAmount).toNumber();
  }

  let total = bnum(0);

  for (const { address, amount } of tokenAmounts) {
    const mainTokenAddress = getUnderlyingTokenAddress(address);
    const mainEquivAmount = getMainTokenEquivalentAmount(address, amount);
    const price = priceFor(mainTokenAddress);
    const amountNumber = Math.abs(parseFloat(mainEquivAmount.toString()));

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
        address: tokenIn,
        amount: tokenAmountIn,
      },
      {
        address: tokenOut,
        amount: tokenAmountOut,
      },
    ];
  }
  return swaps.map(swap => {
    let address = isInvest ? swap.tokenIn : swap.tokenOut;

    return {
      address,
      amount: isInvest ? swap.tokenAmountIn : swap.tokenAmountOut,
    };
  });
}

function getUnderlyingTokenAddress(address: string) {
  const linearPools = props.pool?.onchain?.linearPools;
  return linearPools != null && linearPools[address] != null
    ? linearPools[address].mainToken.address
    : address;
}

function getMainTokenEquivalentAmount(address: string, amount: string) {
  const linearPools = props.pool?.onchain?.linearPools;
  return linearPools != null && linearPools[address] != null
    ? bnum(amount).times(linearPools[address].priceRate)
    : bnum(amount);
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

      <template #detailsCell="action">
        <div class="flex flex-wrap items-center py-4 px-6 -mt-1">
          <template v-if="action.type === 'trade'">
            <div class="token-item">
              <BalAsset
                :address="action.tokenAmounts[0].address"
                class="flex-shrink-0 mr-2"
              />
              <span class="font-numeric">{{
                fNum2(action.tokenAmounts[0].amount, FNumFormats.token)
              }}</span>
            </div>
            <BalIcon name="arrow-right" class="mx-1" />
            <div class="token-item">
              <BalAsset
                :address="action.tokenAmounts[1].address"
                class="flex-shrink-0 mr-2"
              />
              <span class="font-numeric">{{
                fNum2(action.tokenAmounts[1].amount, FNumFormats.token)
              }}</span>
            </div>
          </template>
          <template v-else>
            <template v-for="(tokenAmount, i) in action.tokenAmounts" :key="i">
              <div
                v-if="tokenAmount.amount !== '0'"
                class="flex items-center p-1 px-2 m-1 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <BalAsset
                  :address="tokenAmount.address"
                  class="flex-shrink-0 mr-2"
                />
                <span class="font-numeric">{{
                  fNum2(tokenAmount.amount, FNumFormats.token)
                }}</span>
              </div>
            </template>
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
                class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-secondary"
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
