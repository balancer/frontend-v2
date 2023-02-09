<script lang="ts" setup>
import { SwapSettingsContext } from '@/components/popovers/SwapSettingsPopover.vue';
import { useSwaps } from '@/providers/local/swaps.provider';
import { useI18n } from 'vue-i18n';
import SwapSettingsPopover from '@/components/popovers/SwapSettingsPopover.vue';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { isCowswap } = useSwaps();

/**
 * COMPUTED
 */
// Title for swap card.
const title = computed((): string => {
  // TODO should detect if wrap/unwrap and change title.
  return t('swap');
});
</script>

<template>
  <div class="flex justify-between items-center w-full">
    <h4>{{ title }}</h4>
    <SwapSettingsPopover
      :context="SwapSettingsContext.swap"
      :isGasless="isCowswap"
    />
  </div>
</template>
