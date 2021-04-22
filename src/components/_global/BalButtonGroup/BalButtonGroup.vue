<template>
  <div class="flex switcher">
    <button
      v-for="option in options"
      :key="option.value"
      class="py-1 px-2 text-sm border-2 border-white font-medium rounded-lg"
      :class="{
        'text-gray-500 hover:bg-gray-100': activeOption !== option.value,
        'text-gray-800 border-2 border-gray-800 hover:bg-white':
          activeOption === option.value
      }"
      @click="setActiveOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

type Option = {
  label: string;
  value: string;
};

export default defineComponent({
  props: {
    options: {
      type: Object as PropType<Option[]>,
      required: true
    },
    onChange: {
      type: Function
    },
    defaultValue: {
      type: Number
    }
  },
  setup(props) {
    const activeOption = ref(props.defaultValue);
    const setActiveOption = (value: number) => {
      activeOption.value = value;
      props.onChange && props.onChange(value);
    };

    return {
      activeOption,
      setActiveOption
    };
  }
});
</script>

<style>
.switcher > :not(:last-child) {
  margin-right: 0.5rem;
}
</style>
