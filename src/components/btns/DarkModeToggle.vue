<template>
  <BalBtn
    color="white"
    :size="upToLargeBreakpoint ? 'md' : 'sm'"
    @click="toggleDarkMode"
  >
    <MoonIcon v-if="darkMode" />
    <SunIcon v-else />
  </BalBtn>
</template>

<script lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DarkModeToggle',

  setup() {
    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();
    const { darkMode, toggleDarkMode } = useDarkMode();

    return { darkMode, toggleDarkMode, upToLargeBreakpoint };
  }
});
</script>
