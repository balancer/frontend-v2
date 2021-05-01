<template>
  <div class="flex">
    <BalBtn
      v-for="option in options"
      :key="option.value"
      @click="onSelect(option)"
      outline
      size="sm"
      class="capitalize mr-2 w-18"
      v-bind="attrs_"
      :color="modelValue === option.value ? 'blue' : 'gray'"
    >
      {{ 'best' === option.label ? $t(option.label) : option.label }}
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
