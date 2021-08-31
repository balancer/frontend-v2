<template>
  <BalBtn
    id="intercom-activator"
    color="white"
    :size="upToLargeBreakpoint ? 'md' : 'sm'"
  >
    <IntercomIcon />
  </BalBtn>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  name: 'IntercomToggle',

  setup() {
    const { upToLargeBreakpoint } = useBreakpoints();

    return { upToLargeBreakpoint };
  }
});
</script>
