<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';

import { FullPool } from '@/services/balancer/subgraph/types';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { PoolMigrationInfo } from '@/components/forms/pool_actions/MigrateForm/types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  pool: FullPool;
  isLoading: boolean;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { currency } = useUserSettings();
</script>

<template>
  <BalLoadingBlock v-if="isLoading" class="h-64" />
  <BalCard v-else noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t(`migratePool.${poolMigrationInfo.type}.poolStats.title`) }}
      </h6>
    </div>
    <div class="-mt-2 p-4">
      <div class="mb-3">
        <div class="text-gray-500">
          {{ $t('poolValue') }}
        </div>
        <div class="font-semibold">
          {{ fNum(pool.totalLiquidity, currency) }}
        </div>
      </div>
      <div class="mb-3">
        <div class="text-gray-500">
          {{ $t('volumeTime', ['24h']) }}
        </div>
        <div class="font-semibold">
          {{ fNum(pool.dynamic.volume, currency) }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">{{ $t('apr') }}</div>
        <div class="flex items-center font-semibold">
          {{ fNum(pool.dynamic.apr.total, 'percent') }}
          <LiquidityAPRTooltip :pool="pool" />
        </div>
      </div>
    </div>
  </BalCard>
</template>
