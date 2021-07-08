<template>
  <div :class="['bal-alert', classes]">
    <div :class="['bal-alert-container', containerClasses]">
      <div :class="['bal-alert-icon', iconClasses]">
        <BalIcon name="alert-circle" :size="iconSize" />
      </div>
      <div :class="['bal-alert-content', contentClasses]">
        <div class="">
          <h5 :class="['bal-alert-title', titleClasses, textSizeClass]">
            <slot name="title">
              {{ title }}
            </slot>
          </h5>
          <p
            v-if="$slots.default || description"
            :class="['bal-alert-description', descriptionColor, textSizeClass]"
          >
            <slot>
              {{ description }}
            </slot>
          </p>
        </div>
        <div v-if="actionLabel" :class="[actionClasses]">
          <BalBtn :color="btnColor" size="xs" @click="$emit('actionClick')">
            {{ actionLabel }}
          </BalBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import BalIcon from '../BalIcon/BalIcon.vue';
import BalBtn from '../BalBtn/BalBtn.vue';

type AlertType = 'warning' | 'error' | 'info';

export default defineComponent({
  name: 'BalAlert',

  components: {
    BalIcon,
    BalBtn
  },

  emits: ['actionClick'],

  props: {
    type: { type: String as PropType<AlertType>, default: 'info' },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    title: { type: String, default: 'A title message' },
    description: { type: String },
    actionLabel: { type: String },
    raised: { type: Boolean, default: false },
    block: { type: Boolean, default: false }
  },

  setup(props, { slots }) {
    const bgColorClass = computed(() => {
      switch (props.type) {
        case 'warning':
          return 'bg-yellow-50 text-black';
        case 'error':
          return 'bg-red-50 text-black';
        default:
          return 'bg-black text-white';
      }
    });

    const paddingClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'p-1';
        default:
          return 'p-2';
      }
    });

    const textSizeClass = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'text-xs';
        case 'lg':
          return 'text-base';
        default:
          return 'text-sm';
      }
    });

    const classes = computed(() => {
      return {
        [bgColorClass.value]: true,
        [paddingClasses.value]: true,
        'shadow-sm': props.raised,
        'w-full': props.block
      };
    });

    const containerClasses = computed(() => ({
      'items-center': !props.description && !slots.default
    }));

    const contentClasses = computed(() => ({
      'items-center': !props.description && !slots.default,
      'flex-col': !!props.description || slots.default
    }));

    const iconSizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-5 h-5';
        case 'lg':
          return 'w-7 h-7';
        default:
          return 'w-6 h-6';
      }
    });

    const iconColorClasses = computed(() => {
      switch (props.type) {
        case 'warning':
          return 'text-yellow-500 bg-yellow-500 bg-opacity-10';
        case 'error':
          return 'text-red-500 bg-red-500 bg-opacity-10';
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

    const titleClasses = computed(() => ({
      'font-bold': !!props.description || slots.default
    }));

    const descriptionColor = computed(() => {
      if (props.type === 'info') return 'text-white text-opacity-70';
      return 'text-black text-opacity-70';
    });

    const iconSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'sm';
        default:
          return 'md';
      }
    });

    const btnColor = computed(() => {
      switch (props.type) {
        case 'warning':
          return 'yellow';
        case 'error':
          return 'red';
        default:
          return 'white';
      }
    });

    const actionClasses = computed(() => ({
      'pl-4': !props.description && !slots.default,
      'mt-1': !!props.description || slots.default
    }));

    return {
      classes,
      containerClasses,
      contentClasses,
      iconClasses,
      iconSize,
      titleClasses,
      textSizeClass,
      descriptionColor,
      btnColor,
      actionClasses
    };
  }
});
</script>

<style>
.bal-alert {
  @apply inline-block rounded-lg font-medium;
}

.bal-alert-container {
  @apply flex;
}

.bal-alert-content {
  @apply flex;
}

.bal-alert-icon {
  @apply rounded-full flex items-center justify-center mr-2;
}
</style>
