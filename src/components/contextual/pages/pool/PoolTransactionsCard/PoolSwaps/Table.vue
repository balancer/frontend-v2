<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';

import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

import { PoolSwap } from '@/services/balancer/subgraph/types';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';

import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type SwapRow = {
  tokenIn: string;
  tokenOut: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  timestamp: number;
  formattedDate: string;
  value: number;
  formattedValue: string;
  tx: string;
};

type Props = {
  tokens: string[];
  poolSwaps: PoolSwap[];
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

const swapRows = computed<SwapRow[]>(() =>
  props.isLoading
    ? []
    : props.poolSwaps.map(
        ({
          tokenIn,
          tokenOut,
          tokenAmountIn,
          tokenAmountOut,
          timestamp,
          tx
        }) => {
          const value = bnum(priceFor(tokenOut))
            .times(tokenAmountOut)
            .toNumber();

          return {
            value,
            formattedValue:
              value > 0
                ? fNum2(value, { style: 'currency', abbreviate: true })
                : '-',
            tokenIn,
            tokenOut,
            tokenAmountIn,
            tokenAmountOut,
            timestamp,
            formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
            tx
          };
        }
      )
);
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
      <template v-slot:actionCell>
        <div class="px-6 py-2">
          <div class="flex items-center">
            {{ $t('swap') }}
          </div>
        </div>
      </template>

      <template v-slot:detailsCell="action">
        <div class="px-6 py-4 flex -mt-1 items-center flex-wrap">
          <div class="token-item">
            <BalAsset :address="action.tokenIn" class="mr-2 flex-shrink-0" />
            <span class="font-numeric">{{
              fNum2(action.tokenAmountIn, FNumFormats.token)
            }}</span>
          </div>
          <BalIcon name="arrow-right" class="mx-1" />
          <div class="token-item">
            <BalAsset :address="action.tokenOut" class="mr-2 flex-shrink-0" />
            <span class="font-numeric">{{
              fNum2(action.tokenAmountOut, FNumFormats.token)
            }}</span>
          </div>
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
