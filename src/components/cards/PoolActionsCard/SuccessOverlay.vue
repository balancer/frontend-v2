<template>
  <div
    class="absolute top-0 left-0 w-full h-full bg-white rounded-lg z-10 text-center"
  >
    <div class="flex flex-col justify-between items-center h-full p-4">
      <h3 v-text="title" />
      <div class="flex flex-col items-center">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center bg-green-100 text-green-500 mb-8"
        >
          <BalIcon name="check-circle" size="xl" />
        </div>
        <p v-html="description" class="text-gray-500" />
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4 w-full">
        <BalBtn
          tag="a"
          :href="explorer.txLink(txHash)"
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
import useWeb3 from '@/composables/useWeb3';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuccessOverlay',

  emits: ['close'],

  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    closeLabel: { type: String, required: true },
    txHash: { type: String, required: true }
  },

  setup() {
    const { explorer } = useWeb3();

    return { explorer };
  }
});
</script>
