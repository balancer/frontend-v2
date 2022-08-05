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
    <ul class="pl-6 list-disc">
      <li
        v-for="i18nLabel in poolMigrationInfo.riskI18nLabels"
        :key="i18nLabel"
        class="pt-2"
      >
        {{ $t(i18nLabel) }}
      </li>
    </ul>
  </BalAlert>
</template>
