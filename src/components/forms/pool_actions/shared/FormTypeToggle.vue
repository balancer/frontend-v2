<template>
  <div :class="['flex flex-col px-4 py-2', hasZeroBalance ? 'hidden' : '']">
    <BalRadio
      v-for="(type, i) in formTypes"
      :key="i"
      v-model="selected"
      :value="type.value"
      name="formType"
      class="py-2"
      :disabled="loading"
    >
      <template #label>
        <span>
          {{ type.label }}
        </span>
        <span v-if="!missingPrices" class="text-xs text-secondary">
          ({{ type.max }} {{ $t('max').toLowerCase() }})
        </span>
        <BalTooltip v-if="type.tooltip">
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-2 text-gray-400" />
          </template>
          <div>
            {{ type.tooltip }}
          </div>
        </BalTooltip>
      </template>
    </BalRadio>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

type FormTypes = 'proportional' | 'custom';

interface FormType {
  label: string;
  max: string;
  value: FormTypes;
  tooltip?: string;
}

export default defineComponent({
  name: 'TypeToggle',

  props: {
    formTypes: { type: Object as PropType<FormType[]>, required: true },
    modelValue: { type: String, required: true },
    loading: { type: Boolean, default: false },
    hasZeroBalance: { type: Boolean, default: false },
    missingPrices: { type: Boolean, default: false },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const selected = ref(props.formTypes[0].value);

    watch(selected, newVal => {
      emit('update:modelValue', newVal);
    });

    watch(
      () => props.modelValue,
      newVal => {
        if (selected.value != newVal) selected.value = newVal as FormTypes;
      }
    );

    return {
      selected,
    };
  },
});
</script>
