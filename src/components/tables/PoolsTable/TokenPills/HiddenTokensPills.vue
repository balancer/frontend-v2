<template>
  <div class="relative flex mr-2 my-1">
    <div class="pill" :style="{ zIndex: tokens.length }">
      {{ $t('tokenPills.hiddenTokens', [tokens.length]) }}
    </div>
    <div
      v-for="n in 2"
      :key="n"
      class="pill hidden-pill"
      :style="{
        transform: `translateX(${n * 8}px)`,
        zIndex: tokens.length - n
      }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { PoolToken } from '@/services/balancer/subgraph/types';

export default defineComponent({
  name: 'HiddenTokensPills',

  props: {
    tokens: {
      type: Array as PropType<PoolToken[]>,
      required: true
    }
  }
});
</script>
<style scoped>
.pill {
  @apply px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-600;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.07);
}
.hidden-pill {
  @apply absolute top-0 left-0 h-full w-full;
  box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.07);
}
</style>
