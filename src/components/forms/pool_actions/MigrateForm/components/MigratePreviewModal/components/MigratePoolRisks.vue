<script setup lang="ts">
import { PoolMigrationInfo } from '../../../types';

/**
 * TYPES
 */
type Props = {
  poolMigrationInfo: PoolMigrationInfo;
};

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <BalAlert
    type="warning"
    :title="$t('migratePool.previewModal.riskWarnings.title')"
    block
    class="mb-4"
  >
    <ul class="list-disc pl-6">
      <li
        v-for="i18nLabel in poolMigrationInfo.riskI18nLabels"
        class="pt-2"
        :key="i18nLabel"
      >
        {{ $t(i18nLabel) }}
      </li>
    </ul>
  </BalAlert>
</template>
