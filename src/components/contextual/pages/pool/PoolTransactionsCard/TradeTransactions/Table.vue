<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { shortenLabel } from '@/lib/utils';
import { bnum } from '@/lib/utils';
import { PoolSwap } from '@/services/pool/types';
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
const { priceFor } = useTokens();
const { upToLargeBreakpoint } = useBreakpoints();
const { explorerLinks } = useWeb3();

/**
 * COMPUTED
 */
const columns = computed<ColumnDefinition<SwapRow>[]>(() => [
  {
    name: t('trader'),
    id: 'action',
    accessor: 'tx',
    Cell: 'actionCell',
    width: 190,
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
    name: t('tradeDetails'),
    id: 'details',
    accessor: '',
    Cell: 'detailsCell',
    width: 310,
    sortable: false,
  },

  {
    name: t('time'),
    id: 'timeAgo',
    accessor: 'timestamp',
    Cell: 'timeCell',
    align: 'right',
    sortKey: pool => pool.timestamp,
    width: 190,
  },
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
          tx,
          userAddress,
          ensName,
          ensAvatar,
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
            userAddress: userAddress.id,
            ensName,
            ensAvatar,
            formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
            tx,
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
            <BalAsset
              class="flex-shrink-0 mr-2"
              :address="action.userAddress"
              :iconURI="action.ensAvatar"
              :size="30"
            />
            <span :class="[action.ensName && 'truncate']">
              {{ action.ensName || shortenLabel(action.userAddress) }}
            </span>
          </div>
        </div>
      </template>

      <template #valueCell="action">
        <div class="flex justify-end py-4 px-6 font-numeric">
          {{ action.formattedValue }}
        </div>
      </template>

      <template #detailsCell="action">
        <div class="flex flex-wrap items-center py-4 px-6 -mt-1">
          <div class="token-item">
            <BalAsset :address="action.tokenIn" class="flex-shrink-0 mr-2" />
            <span class="font-numeric">{{
              fNum2(action.tokenAmountIn, FNumFormats.token)
            }}</span>
          </div>
          <BalIcon name="arrow-right" class="mx-1" />
          <div class="token-item">
            <BalAsset :address="action.tokenOut" class="flex-shrink-0 mr-2" />
            <span class="font-numeric">{{
              fNum2(action.tokenAmountOut, FNumFormats.token)
            }}</span>
          </div>
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

<style scoped>
.token-item {
  @apply m-1 flex items-center p-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg;
}
</style>
