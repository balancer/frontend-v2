<template>
  <div class="flex">
    <BalBtn
      v-for="option in options"
      :key="option.value"
      @click="onSelect(option)"
      :active="modelValue === option.value"
      v-bind="attrs_"
    >
      {{ option.label }}
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import omit from 'lodash/omit';

interface Option {
  value: string | number;
  label: string;
}

export default defineComponent({
  name: 'BalBtnGroup',

  inheritAttrs: false,

  emits: ['update:modelValue'],

  props: {
    modelValue: { type: [String, Number], required: true },
    options: { type: Array as PropType<Option[]>, required: true }
  },

  setup(props, { emit, attrs }) {
    // COMPUTED
    const attrs_ = computed(() => omit(attrs, 'options'));

    // METHODS
    function onSelect(option: Option) {
      emit('update:modelValue', option.value);
    }

    return {
      // computed
      attrs_,

      // methods
      onSelect
    };
  }
});
</script>
