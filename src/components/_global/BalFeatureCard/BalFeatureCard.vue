<template>
  <BalCard greedyContent noPad maxHeight>
    <template v-slot:header>
      <div
        class="w-full h-40 bg-center"
        :style="{
          backgroundImage: `url('${imgSrc}')`
        }"
      />
    </template>
    <div class="p-4">
      <slot />
    </div>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    imgSrc: {
      type: String,
      required: true
    }
  },
  setup() {
    return {};
  }
});
</script>
