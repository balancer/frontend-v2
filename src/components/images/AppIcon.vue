<template>
  <img v-if="darkMode" src="~@/assets/logo-dark.svg" width="30" class="mr-2" />
  <img v-else src="~@/assets/logo-light.svg" width="30" class="mr-2" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'AppIcon',

  setup() {
    // COMPOSABLES
    const store = useStore();

    // COMPUTED
    const darkMode = computed(() => store.state.app.darkMode);

    return {
      darkMode
    };
  }
});
</script>
