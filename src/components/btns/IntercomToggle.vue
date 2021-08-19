<template>
  <BalBtn
    id="intercom-activator"
    color="white"
    :size="upToLargeBreakpoint ? 'md' : 'sm'"
    class="hidden xs:inline-block"
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
