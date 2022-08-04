<template>
  <span class="relative text-orange-500">
    <span
      class="absolute top-1/2 left-1/2 text-sm transform -translate-x-1/2 -translate-y-1/2"
    >
      {{ count }}
    </span>
    <SpinnerIcon class="w-6 h-6 animate-spin" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActivityCounter',

  props: {
    count: {
      type: Number,
      required: true,
    },
  },
});
</script>
