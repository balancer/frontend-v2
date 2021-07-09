<template>
  <div class="flex relative">
    <div
      v-if="hasBalance"
      class="w-3 h-3 rounded-full border-2 border-white group-hover:border-gray-50 bg-green-200 absolute top-0 right-0 -mt-1 -mr-1"
    />
    <div class="px-2 py-1">
      {{ symbol }}
    </div>
    <div class="relative">
      <div
        v-if="!isLast"
        class="absolute w-1 h-10 -mt-1 -ml-px bg-white group-hover:bg-gray-50 transform rotate-12"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StableTokenPill',

  props: {
    hasBalance: { type: Boolean, default: false },
    symbol: { type: String, required: true },
    isLast: { type: Boolean, default: false }
  }
});
</script>
