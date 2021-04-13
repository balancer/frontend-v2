<template>
  <a :href="href" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    href: {
      type: String,
      required: true
    }
  }
});
</script>
