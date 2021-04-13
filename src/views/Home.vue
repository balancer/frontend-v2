<template>
  <div>
    <Edito />
    <div class="container mx-auto">
      <MainMenu class="mt-6" />
      <TablePools
        class="mt-2"
        :pools="poolData.pools"
        :snapshots="poolData.snapshots"
      />
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
      poolData: computed(() => store.state.pools.all)
    };
  }
});
</script>
