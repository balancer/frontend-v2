<template>
  <div
    class="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-850 rounded-lg z-10 text-center"
  >
    <div class="flex flex-col justify-between items-center h-full p-4">
      <h3 v-text="title" />
      <div class="flex flex-col items-center">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-500 text-green-500 dark:text-gray-850 mb-8"
        >
          <BalIcon name="check-circle" size="xl" />
        </div>
        <p v-html="description" class="text-gray-500" />
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
          <BalIcon name="external-link" size="sm" class="ml-2" />
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

  emits: ['close'],

  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    closeLabel: { type: String, required: true },
    explorerLink: { type: String, required: true }
  }
});
</script>
