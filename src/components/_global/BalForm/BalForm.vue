<script lang="ts" setup>
import { onBeforeMount, provide } from 'vue';
import { FormContextSymbol, FormInstance } from './useForm';

type SubmitFn = () => void;

type Props = {
  form: FormInstance<unknown>;
  submit: SubmitFn;
};

const props = withDefaults(defineProps<Props>(), {});

provide(FormContextSymbol, props.form);

onBeforeMount(() => {
  if (!props.form) {
    throw new Error(
      `<BalForm /> component was rendered without a form instance.`
    );
  }
});

/**
 * METHODS
 */
</script>

<template>
  <form @submit.prevent="submit">
    <slot />
  </form>
</template>
