<template>
  <img
    v-if="darkMode"
    src="~@/assets/images/symmetricIcon.svg"
    width="30"
    class="mr-2"
  />
  <img v-else src="~@/assets/images/symmetricIcon.svg" width="30" class="mr-2" />
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
