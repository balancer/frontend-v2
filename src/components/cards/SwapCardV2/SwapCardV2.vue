<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';
import SwapHeader from './components/SwapHeader.vue';
import SwapInputs from './components/SwapInputs.vue';

/**
 * COMPOSABLES
 */
const { bp } = useBreakpoints();

/**
 * COMPUTED
 */
// Change card shadow based on screen size. On mobile we want it to appear flat.
const swapCardShadow = computed(() => {
  switch (bp.value) {
    case 'xs':
      return 'none';
    case 'sm':
      return 'lg';
    default:
      return 'xl';
  }
});
</script>

<template>
  <BalCard class="relative card-container" :shadow="swapCardShadow" noBorder>
    <template #header>
      <SwapHeader />
    </template>
    <div>
      <div>
        <SwapInputs />
        <!-- <SwapAlerts />
        <SwapActions /> -->
      </div>
    </div>
  </BalCard>
  <!-- <teleport to="#modal">
    <SwapPreviewModal
      v-if="modalSwapPreviewIsOpen"
      :swapping="swapping"
      :error="error"
      :warning="warning"
      @swap="swap"
      @close="handlePreviewModalClose"
    />
  </teleport> -->
</template>
<style scoped>
/* This is needed because the swap settings popover overflows */
.card-container {
  overflow: unset;
}

.swap-gasless :deep(.bal-toggle) {
  width: 3rem;
}

.gas-symbol {
  @apply h-8 w-8 rounded-full flex items-center justify-center text-lg bg-gray-50 dark:bg-gray-800;
}

.gas-symbol::before {
  content: '⛽';
}

.signature-symbol::before {
  content: '✍️';
}
</style>
