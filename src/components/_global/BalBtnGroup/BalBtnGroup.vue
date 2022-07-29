<template>
  <div class="flex">
    <BalBtn
      v-for="option in options"
      :key="option.value"
      outline
      size="sm"
      class="mr-2 capitalize w-18"
      v-bind="attrs_"
      :color="modelValue === option.value ? 'blue' : 'gray'"
      @click="onSelect(option)"
    >
      {{ 'best' === option.label ? $t(option.label) : option.label }}
    </BalBtn>
  </div>
</template>

<script lang="ts">
import omit from 'lodash/omit';
import { computed, defineComponent, PropType } from 'vue';

interface Option {
  value: string | number;
  label: string;
}

export default defineComponent({
  name: 'BalBtnGroup',

  inheritAttrs: false,

  props: {
    modelValue: { type: [String, Number], required: true },
    options: { type: Array as PropType<Option[]>, required: true },
  },

  emits: ['update:modelValue'],

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
      onSelect,
    };
  },
});
</script>
