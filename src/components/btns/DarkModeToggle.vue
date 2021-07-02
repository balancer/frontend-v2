<template>
  <BalBtn color="gray" size="sm" outline circle @click="toggleDarkMode">
    <BalIcon v-if="darkMode" name="moon" />
    <BalIcon v-else name="sun" />
  </BalBtn>
</template>

<script lang="ts">
import useDarkMode from '@/composables/useDarkMode';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DarkModeToggle',

  setup() {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return { darkMode, toggleDarkMode };
  }
});
</script>
