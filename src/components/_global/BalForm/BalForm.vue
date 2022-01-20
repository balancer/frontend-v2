<script lang="ts" setup>
import { provide, useSlots, h } from 'vue';
import useForm from './useForm';

type Props = {
  name: string;
};

const props = withDefaults(defineProps<Props>(), {});

const slots = useSlots();

/**
 * COMPUTED
 */
/**
 * METHODS
 */
</script>

<template>
  <form>
    <slot />
  </form>
</template>
