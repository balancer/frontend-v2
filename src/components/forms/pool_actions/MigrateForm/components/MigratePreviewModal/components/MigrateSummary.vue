<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  priceImpact: number;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
</script>

<template>
  <div class="summary-table">
    <h6 class="p-2">
      {{ $t('migratePool.previewModal.summary.title') }}
    </h6>
    <div class="flex flex-col py-2">
      <div class="summary-table-row">
        <div class="summary-table-label">
          {{ $t('priceImpact') }}
        </div>
        <div class="summary-table-number">
          {{ fNum(priceImpact, 'percent') }}
          <BalTooltip
            :text="$t('tooltips.migratePool.priceImpact')"
            icon-size="sm"
            width="72"
            class="ml-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}

.summary-table-row {
  @apply grid grid-cols-2 px-2 py-1;
}

.summary-table-label {
  @apply flex items-center;
}

.summary-table-number {
  @apply flex items-center justify-end;
}
</style>
