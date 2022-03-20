<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
const { darkMode, toggleDarkMode } = useDarkMode();
</script>

<template>
  <BalBtn
    color="white"
    :size="isMobile ? 'md' : 'sm'"
    :circle="isMobile"
    @click="toggleDarkMode"
  >
    <MoonIcon v-if="darkMode" />
    <SunIcon v-else />
  </BalBtn>
</template>
