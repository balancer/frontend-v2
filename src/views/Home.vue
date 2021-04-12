<template>
  <div>
    <Edito />
    <div class="container mx-auto">
      <MainMenu class="mt-6" />
      <TablePools class="mt-2" :pools="allPools" />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    // COMPOSABLES
    const store = useStore();

    return {
      allPools: computed(() => store.state.pools.all)
    };
  }
});
</script>
