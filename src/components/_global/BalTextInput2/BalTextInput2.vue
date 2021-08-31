<script lang="ts">
// https://v3.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
enum InputType {
  text = 'text',
  number = 'number',
  date = 'date',
  email = 'email',
  password = 'password'
}

interface Props {
  name: string;
  type?: InputType;
  modelValue?: string | number;
  disabled: boolean;
}

withDefaults(defineProps<Props>(), {
  type: InputType.text,
  modelValue: '',
  disabled: false
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
}>();

function onBlur(event) {
  emit('blur', event.target.value);
}

// function onInput() {}
// function onKeydown() {}
</script>

<template>
  <div>
    <input
      :type="type"
      :name="name"
      :value="modelValue"
      v-bind="$attrs"
      :disabled="disabled"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeydown"
    />
  </div>
</template>
