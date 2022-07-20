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
console.log('poolMigrationInfo', poolMigrationInfo)
//http://localhost:8080/#/pool/migrate/0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f/0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f
</script>

<template>
  <MigrateForm
    v-if="poolMigrationInfo"
    :poolMigrationInfo="poolMigrationInfo"
  />
  <div v-else class="text-center">
    <div class="font-semibold text-lg">
      {{ $t('migratePool.errorLoadingMigration.title') }}
    </div>
    <div>{{ $t('migratePool.errorLoadingMigration.description') }}</div>
  </div>
</template>
