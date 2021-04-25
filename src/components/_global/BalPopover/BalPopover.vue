<template>
  <div class="relative">
    <div class="bal-popover-activator">
      <slot name="activator" />
    </div>
    <div class="bal-popover-wrapper">
      <BalCard shadow="lg" v-bind="$attrs">
        <slot />
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalPopover',

  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' }
  }
});
</script>

<style>
.bal-popover-activator:hover ~ .bal-popover-wrapper {
  @apply visible opacity-100;
}

.bal-popover-wrapper {
  @apply top-full invisible opacity-0 absolute z-10 pt-3 right-0;
  transition: all 0.2s ease-in-out;
}

.bal-popover-wrapper:hover {
  @apply visible opacity-100;
}
</style>
