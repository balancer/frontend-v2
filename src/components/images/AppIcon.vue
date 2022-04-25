<template>
  <img
    v-if="darkMode"
    src="~@/assets/images/logo-dark.svg"
    width="30"
    class="mr-2"
  />
  <img v-else src="~@/assets/images/logo-light.svg" width="30" class="mr-2" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useDarkMode from '@/composables/useDarkMode';

export default defineComponent({
  name: 'AppIcon',

  setup() {
    const { darkMode } = useDarkMode();

    return {
      darkMode
    };
  }
});
</script>
