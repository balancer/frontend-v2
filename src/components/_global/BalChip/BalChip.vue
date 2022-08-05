<script setup lang="ts">
import BalIcon from '../BalIcon/BalIcon.vue';
import {
  useChipClasses,
  useCloseIconClasses,
} from './composables/useChipStyles';

type Props = {
  label?: string;
  closeable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'gray' | 'gradient' | 'white' | 'red' | 'orange';
  outline?: boolean;
  rounded?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  label: '',
  closeable: false,
  size: 'md',
  color: 'gray',
  rounded: false,
  outline: true,
});

const emit = defineEmits(['closed']);

const classes = useChipClasses(props);
const { classes: iconClasses, iconSize } = useCloseIconClasses(props);
</script>

<template>
  <div :class="['bal-chip', classes]">
    <div class="content-container">
      <span v-if="label">
        {{ label }}
      </span>
      <slot v-else />
      <div v-if="closeable" @click="emit('closed')">
        <BalIcon name="x" :size="iconSize" :class="['close', iconClasses]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bal-chip {
  @apply inline-block whitespace-nowrap;
}

.content-container {
  @apply flex items-center leading-none h-full;
}

.close {
  @apply cursor-pointer ml-1 -mb-px text-gray-400;
}
</style>
