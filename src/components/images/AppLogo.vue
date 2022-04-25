<template>
  <div class="flex items-center">
    <AppIcon />
    <span class="mr-1 font-secondary text-xl font-semibold">
      Balancer
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from './AppIcon.vue';

export default defineComponent({
  name: 'AppLogo',

  components: {
    AppIcon
  }
});
</script>
