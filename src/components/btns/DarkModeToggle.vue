<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
</script>

<template>
  <BalBtn color="white" :size="isMobile ? 'md' : 'sm'" :circle="isMobile">
  </BalBtn>
</template>
