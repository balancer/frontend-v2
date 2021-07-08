<template>
  <div
    class="flex items-center px-2 mr-2 my-1 py-1 rounded-lg bg-gray-100 relative"
  >
    <div
      v-if="hasBalance"
      class="w-3 h-3 rounded-full border-2 border-white group-hover:border-gray-50 bg-green-200 absolute top-0 right-0 -mt-1 -mr-1"
    />
    <span>
      {{ symbol }}
    </span>
    <span class="font-medium text-gray-400 text-xs mt-px ml-1">
      {{ weight }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WeightedTokenPill',

  props: {
    hasBalance: { type: Boolean, default: false },
    symbol: { type: String, required: true },
    weight: { type: String, required: true }
  }
});
</script>
