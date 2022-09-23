<script setup lang="ts">
import { computed } from 'vue';

import { PoolMigrationInfo } from '@/components/forms/pool_actions/MigrateForm/types';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { totalAprLabel } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => {
  const poolAPRs = props.pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool.boost);
});
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t(`migratePool.${poolMigrationInfo.type}.poolStats.title`) }}
      </h6>
    </div>
    <div class="p-4">
      <div class="mb-3">
        <div class="text-sm text-secondary">
          {{ $t('poolValue') }}
        </div>
        <div class="font-semibold">
          {{ fNum2(pool.totalLiquidity, FNumFormats.fiat) }}
        </div>
      </div>
      <div class="mb-3">
        <div class="text-sm text-secondary">
          {{ $t('volumeTime', ['24h']) }}
        </div>
        <div class="font-semibold">
          {{ fNum2(pool.volumeSnapshot || '0', FNumFormats.fiat) }}
        </div>
      </div>
      <div>
        <div class="text-sm text-secondary">
          {{ $t('apr') }}
        </div>
        <div class="flex items-center font-semibold">
          {{ aprLabel }}
          <APRTooltip :pool="pool" />
        </div>
      </div>
    </div>
  </BalCard>
</template>
