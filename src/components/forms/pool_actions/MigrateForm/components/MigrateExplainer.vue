<script setup lang="ts">
import { PoolMigrationInfo } from '@/components/forms/pool_actions/MigrateForm/types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
};

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t(`migratePool.${poolMigrationInfo.type}.whyMigrate.title`) }}
      </h6>
    </div>
    <div class="p-4 -mt-2">
      <div class="text-secondary">
        {{ $t(`migratePool.${poolMigrationInfo.type}.whyMigrate.description`) }}
      </div>
    </div>
  </BalCard>
</template>
