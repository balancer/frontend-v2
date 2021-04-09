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
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    // COMPOSABLES
    const store = useStore();

    // DATA
    const allPools = store.state.pools.all;

    return {
      allPools
    };
  }
});
</script>
