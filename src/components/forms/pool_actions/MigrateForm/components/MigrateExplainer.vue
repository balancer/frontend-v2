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
    <div class="-mt-2 p-4">
      <div class="text-gray-500">
        {{ $t(`migratePool.${poolMigrationInfo.type}.whyMigrate.description`) }}
      </div>
    </div>
  </BalCard>
</template>
