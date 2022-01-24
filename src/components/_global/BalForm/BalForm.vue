<script lang="ts" setup>
import { onBeforeMount, provide } from 'vue';
import { FormContextSymbol, FormInstance } from './useForm';

type Props = {
  form: FormInstance;
};

const props = withDefaults(defineProps<Props>(), {});

provide(FormContextSymbol, props.form);

onBeforeMount(() => {
  if (!props.form) {
    throw new Error(`<BalForm /> component was rendered with a form instance.`);
  }
});

/**
 * METHODS
 */
</script>

<template>
  <form>
    <slot />
  </form>
</template>
