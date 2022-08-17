<script setup lang="ts">
import {
  PoolMigrationInfo,
  PoolMigrationType,
} from '@/components/forms/pool_actions/MigrateForm/types';
import { computed } from 'vue';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const isStabal3Migration = computed(
  () => props.poolMigrationInfo.type === PoolMigrationType.STABAL3_POOL
);
</script>

<template>
  <BalCard noPad shadow="none" class="mb-5">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t(`migratePool.migrateReason.title`) }}
      </h6>
    </div>
    <div class="p-4 -mt-2">
      <div class="text-sm text-secondary">
        {{ $t(`migratePool.migrateReason.description`) }}
      </div>
    </div>
  </BalCard>

  <BalCard v-if="isStabal3Migration" noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t(`migratePool.${poolMigrationInfo.type}.whyMigrate.title`) }}
      </h6>
    </div>
    <div class="p-4 -mt-2">
      <div class="text-sm text-secondary">
        {{ $t(`migratePool.${poolMigrationInfo.type}.whyMigrate.description`) }}
      </div>
    </div>
  </BalCard>
</template>
