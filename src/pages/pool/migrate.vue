<script setup lang="ts">
import { useRoute } from 'vue-router';

import MigrateForm from '@/components/forms/pool_actions/MigrateForm/MigrateForm.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { configService } from '@/services/config/config.service';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * STATE
 */
const fromPoolId = route.params.from as string;
const poolMigrationInfo = configService.network.pools.Migrations?.[fromPoolId];

providePoolStaking(fromPoolId);
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
