<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import { FullPool } from '@/services/balancer/subgraph/types';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { PoolMigrationInfo } from '@/components/forms/pool_actions/MigrateForm/types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  pool: FullPool;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
</script>

<template>
  <BalCard noPad shadow="none">
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
          {{ fNum2(pool.totalLiquidity, FNumFormats.fiat) }}
        </div>
      </div>
      <div class="mb-3">
        <div class="text-gray-500">
          {{ $t('volumeTime', ['24h']) }}
        </div>
        <div class="font-semibold">
          {{ fNum2(pool.dynamic.volume, FNumFormats.fiat) }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">{{ $t('apr') }}</div>
        <div class="flex items-center font-semibold">
          {{ fNum2(pool.dynamic.apr.total, FNumFormats.percent) }}
          <LiquidityAPRTooltip :pool="pool" />
        </div>
      </div>
    </div>
  </BalCard>
</template>
