<template>
  <div class="p-3 flex justify-between items-center border border-red-500">
    <div class="flex items-center">
      <BalIcon class="mr-2.5 text-red-500" name="alert-circle" />
      <div>
        <div class="font-bold text-sm">{{ header }}</div>
        <div v-if="body" class="text-sm">{{ body }}</div>
      </div>
    </div>
    <BalBtn
      v-if="buttonLabel"
      class="ml-2.5"
      :label="buttonLabel"
      color="red"
      size="sm"
      @click="$emit('click')"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    header: {
      type: String,
      required: true
    },
    body: {
      type: String
    },
    buttonLabel: {
      type: String
    }
  },
  emits: ['click']
});
</script>
