<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';

/**
 * TYPES
 */
type Props = {
  expectedVeBalAmount: string;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { veBalTokenInfo } = useVeBal();
</script>

<template>
  <div class="container">
    <div class="row">
      <div>{{ $t('getVeBAL.lockForm.summary.receive.title') }}</div>
      <div>
        {{
          expectedVeBalAmount != null
            ? fNum2(expectedVeBalAmount, FNumFormats.token)
            : '-'
        }}
        {{ veBalTokenInfo.symbol }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  @apply border dark:border-gray-800 bg-gray-50 dark:bg-gray-800 divide-y dark:divide-gray-850 rounded-lg text-sm;
}

.row {
  @apply p-3 flex justify-between;
}
</style>
