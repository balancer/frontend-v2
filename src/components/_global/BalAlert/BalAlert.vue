<template>
  <div :class="['bal-alert', classes]">
    <div class="bal-alert-container">
      <div :class="['bal-alert-icon', iconClasses]">
        <BalIcon name="alert-circle" :size="iconSize" />
      </div>
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

type AlertType = 'warning' | 'error' | 'info';

export default defineComponent({
  name: 'BalAlert',

  props: {
    type: { type: String as PropType<AlertType>, default: 'info' },
    size: {
      type: String,
      default: 'sm',
      validator: (val: string): boolean => ['sm'].includes(val)
    },
    label: { type: String, default: '' }
  },

  setup(props) {
    const bgColorClass = computed(() => {
      switch (props.type) {
        case 'warning':
          return 'bg-yellow-100 border border-yellow-500 text-black';
        case 'error':
          return 'bg-red-500 text-white';
        default:
          return 'bg-black text-white';
      }
    });

    const paddingClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'p-1 pl-1 pr-4';
        default:
          return 'p-1 pl-1 pr-4';
      }
    });

    const textSizeClass = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'text-xs';
        default:
          return 'text-xs';
      }
    });

    const classes = computed(() => {
      return {
        [bgColorClass.value]: true,
        [paddingClasses.value]: true,
        [textSizeClass.value]: true
      };
    });

    const iconSizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-5 h-5';
        default:
          return 'w-5 h-5';
      }
    });

    const iconColorClasses = computed(() => {
      switch (props.type) {
        case 'warning':
          return 'text-yellow-500';
        case 'error':
          return 'text-white bg-white bg-opacity-20';
        default:
          return 'text-white bg-white bg-opacity-20';
      }
    });

    const iconClasses = computed(() => {
      return {
        [iconSizeClasses.value]: true,
        [iconColorClasses.value]: true
      };
    });

    const iconSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'sm';
        default:
          return 'sm';
      }
    });

    return { classes, iconClasses, iconSize };
  }
});
</script>

<style>
.bal-alert {
  @apply inline-block shadow-sm rounded-full font-medium;
}

.bal-alert-container {
  @apply flex items-center;
}

.bal-alert-icon {
  @apply rounded-full flex items-center justify-center mr-2;
}
</style>
