<template>
  <div class="flex flex-col px-4 py-2">
    <BalRadioInput
      v-for="(type, i) in formTypes"
      :key="i"
      v-model="selected"
      :value="type.value"
      name="formType"
      class="py-2"
      :disabled="loading"
    >
      <template v-slot:label>
        <span>
          {{ type.label }}
        </span>
        <span class="text-xs text-gray-500"> ({{ type.max }} max) </span>
        <BalTooltip
          v-if="type.tooltip"
          :width="250"
          :height="100"
          on-hover
          top
          left
        >
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="text-gray-400 -mb-px" />
          </template>
          <div class="p-2 text-xs text-gray-500">
            {{ type.tooltip }}
          </div>
        </BalTooltip>
      </template>
    </BalRadioInput>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

interface FormType {
  label: string;
  max: string;
  value: string;
  tooltip?: string;
}

export default defineComponent({
  name: 'TypeToggle',

  emits: ['update:modelValue'],

  props: {
    formTypes: { type: Object as PropType<FormType[]>, required: true },
    modelValue: { type: String, required: true },
    loading: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    const selected = ref(props.formTypes[0].value);

    watch(selected, newVal => {
      emit('update:modelValue', newVal);
    });

    return {
      selected
    };
  }
});
</script>
