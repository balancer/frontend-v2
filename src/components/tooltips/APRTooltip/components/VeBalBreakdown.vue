<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  apr: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => fNum2(props.apr, FNumFormats.percent));

const items = computed((): string[] => [
  t('tooltips.veBalApr.breakdown1'),
  t('tooltips.veBalApr.breakdown2'),
]);
</script>

<template>
  <BalBreakdown :items="items">
    {{ aprLabel }}
    <span class="ml-1 text-xs text-secondary">
      {{ $t('tooltips.veBalApr.title') }}
    </span>
    <template #item="{ item }">
      <div class="text-xs text-secondary">
        {{ item }}
      </div>
    </template>
  </BalBreakdown>
</template>
