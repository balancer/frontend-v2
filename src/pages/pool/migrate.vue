<script setup lang="ts">
import { useRoute } from 'vue-router';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';
import MigrateForm from '@/components/forms/pool_actions/MigrateForm/MigrateForm.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * STATE
 */
const fromPoolId = route.params.from as string;
const toPoolId = route.params.to as string;
const poolMigrationInfo = POOL_MIGRATIONS.find(
  poolMigrationInfo =>
    poolMigrationInfo.fromPoolId === fromPoolId &&
    poolMigrationInfo.toPoolId === toPoolId
);
</script>

<template>
  <MigrateForm
    v-if="poolMigrationInfo"
    :poolMigrationInfo="poolMigrationInfo"
  />
  <div v-else class="text-center">
    <div class="text-lg font-semibold">
      {{ $t('migratePool.errorLoadingMigration.title') }}
    </div>
    <div>{{ $t('migratePool.errorLoadingMigration.description') }}</div>
  </div>
</template>
