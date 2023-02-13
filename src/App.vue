<script lang="ts">
import * as Layouts from '@/pages/_layouts';

export default defineComponent({
  components: {
    ...Layouts,
  },

  setup() {
    /**
     * STATE
     */
    const layout = ref('DefaultLayout');
    /**
     * COMPOSABLES
     */

    /**
     * CALLBACKS
     */

    /**
     * WATCHERS
     */

    return {
      // state
      layout,
    };
  },
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="layout" />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
