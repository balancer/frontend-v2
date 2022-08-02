<template>
  <div
    class="absolute top-0 left-0 z-10 w-full h-full text-center bg-white dark:bg-gray-850 rounded-lg"
  >
    <div class="flex flex-col justify-between items-center p-4 h-full">
      <h3 v-text="title" />
      <div class="flex flex-col items-center">
        <div
          class="flex justify-center items-center mb-8 w-20 h-20 text-green-500 dark:text-gray-850 bg-green-100 dark:bg-green-500 rounded-full"
        >
          <BalIcon name="check-circle" size="xl" />
        </div>
        <p class="text-secondary" v-html="description" />
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4 w-full">
        <BalBtn
          tag="a"
          :href="explorerLink"
          target="_blank"
          rel="noreferrer"
          flat
          color="gray"
        >
          <span v-text="$t('receipt')" />
          <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
        </BalBtn>
        <BalBtn :label="closeLabel" color="gray" flat @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuccessOverlay',

  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    closeLabel: { type: String, required: true },
    explorerLink: { type: String, required: true },
  },

  emits: ['close'],
});
</script>
