<script lang="ts" setup>
import {
  isLiquidityBootstrapping,
  isBoosted,
} from '@/composables/usePoolHelpers';
import { poolMetadata } from '@/lib/config/metadata';
import { Pool } from '@/services/pool/types';
import { PoolMetadata } from '@/types/pools';
import BalChipNew from '@/components/chips/BalChipNew.vue';
import BoostedChip from '@/components/chips/BoostedChip.vue';
import PoolWarningTooltip from '@/components/pool/PoolWarningTooltip.vue';

type Props = {
  pool: Pool;
};

defineProps<Props>();
</script>

<template>
  <div>
    <BalTooltip v-if="isBoosted(pool)" :text="$t('boostedTooltip')" width="56">
      <template #activator>
        <BoostedChip
          :metadata="poolMetadata(pool.id) as PoolMetadata"
          class="ml-4"
        />
      </template>
    </BalTooltip>

    <BalChip
      v-if="isLiquidityBootstrapping(pool.poolType)"
      label="LBP"
      color="amber"
      class="font-medium"
    />
    <BalChipNew v-else-if="pool?.isNew" />

    <PoolWarningTooltip :pool="pool" />
  </div>
</template>
