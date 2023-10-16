<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';
import { useAppzi } from '@/composables/useAppzi';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
const { openNpsModal } = useAppzi();
</script>

<template>
  <BalBtn
    color="white"
    :size="isMobile ? 'md' : 'sm'"
    :circle="isMobile"
    class="px-0 w-9"
    @click="openNpsModal"
  >
    <ThumbsUpIcon />
  </BalBtn>
</template>
