<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isDeep, isLinear, isStableLike } from '@/composables/usePoolHelpers';
import { findByAddress } from '@/lib/utils';
import { Pool, PoolToken } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  token: TokenInfo | undefined;
  weight: string;
  address: string;
  fiatAmountOut: string | undefined;
  loading: boolean;
  pool: Pool;
  value: string;
};

/**
 * Props
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const poolToken = computed((): PoolToken | undefined => {
  return findByAddress(props.pool.tokens, props.address);
});
</script>

<template>
  <div class="flex justify-between items-center p-4">
    <div class="flex items-center">
      <BalAsset :address="address" class="mr-2" />
      <div class="flex flex-col leading-none">
        <div class="text-lg font-medium">
          {{ props.token?.symbol || poolToken?.symbol }}
          <span
            v-if="
              !isStableLike(pool.poolType) &&
              !isDeep(pool) &&
              !isLinear(pool.poolType)
            "
          >
            {{
              fNum(weight, {
                style: 'percent',
                maximumFractionDigits: 0,
              })
            }}
          </span>
        </div>
        <div class="flex text-sm text-gray-600 dark:text-gray-400 max-w-52">
          <span class="truncate">
            {{ props.token?.name }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end pl-2 text-right grow font-numeric">
      <BalLoadingBlock v-if="loading" class="w-20 h-12" />
      <template v-else>
        <span class="text-xl font-medium break-words">
          {{ fNum(value, FNumFormats.token) }}
        </span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ fNum(fiatAmountOut || '0', FNumFormats.fiat) }}
        </span>
      </template>
    </div>
  </div>
</template>


