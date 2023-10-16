<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  apr: number;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => fNum(props.apr, FNumFormats.bp));
</script>

<template>
  <div
    data-testid="vebal-apr"
    class="flex justify-between items-center text-sm font-bold"
  >
    <span>{{ $t('tooltips.veBalApr.title') }}</span>
    <span>{{ aprLabel }}</span>
  </div>
</template>
