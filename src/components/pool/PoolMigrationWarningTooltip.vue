<script setup lang="ts">
import { isMigratablePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';
import { isSoftMigratablePool } from '../forms/pool_actions/MigrateForm/constants';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};
defineProps<Props>();
</script>
<template>
  <BalTooltip
    v-if="isMigratablePool(pool) && !isSoftMigratablePool(pool.id)"
    class="mb-1 ml-2 text-red-500"
    name="alert-circle"
    filled
    size="md"
  >
    <template #activator>
      <BalIcon class="mt-1" name="alert-triangle" size="md" />
    </template>

    <div class="text-sm text-left">
      {{ $t('deprecatedPool') }}
    </div>
  </BalTooltip>
</template>