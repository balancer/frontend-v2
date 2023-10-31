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
    class="w-9 !px-0"
    @click="openNpsModal"
  >
    <ThumbsUpIcon />
  </BalBtn>
</template>
