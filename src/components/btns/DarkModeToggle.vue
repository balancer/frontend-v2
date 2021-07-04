<template>
  <BalBtn
    color="gray"
    :size="upToLargeBreakpoint ? 'md' : 'sm'"
    outline
    circle
    @click="toggleDarkMode"
    class="hidden xs:inline-block"
  >
    <BalIcon v-if="darkMode" name="moon" />
    <BalIcon v-else name="sun" />
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
