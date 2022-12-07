<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isDeep, isStableLike } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';
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
const { fNum2 } = useNumbers();
</script>

<template>
  <div class="flex justify-between items-center p-4">
    <div class="flex items-center">
      <BalAsset :address="address" class="mr-2" />
      <div class="flex flex-col leading-none">
        <div class="text-lg font-medium">
          {{ props.token?.symbol }}
          <span v-if="!isStableLike(pool.poolType) && !isDeep(pool)">
            {{
              fNum2(weight, {
                style: 'percent',
                maximumFractionDigits: 0,
              })
            }}
          </span>
        </div>
        <div class="flex w-52 text-sm text-gray-600 dark:text-gray-400">
          <span class="truncate">
            {{ props.token?.name }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-grow items-end pl-2 text-right font-numeric">
      <BalLoadingBlock v-if="loading" class="w-20 h-12" />
      <template v-else>
        <span class="text-xl font-medium break-words">
          {{ fNum2(value, FNumFormats.token) }}
        </span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ fNum2(fiatAmountOut || '0', FNumFormats.fiat) }}
        </span>
      </template>
    </div>
  </div>
</template>


