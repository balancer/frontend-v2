<template>
  <slot />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    providerFunction: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    props.providerFunction();
  }
});
</script>
