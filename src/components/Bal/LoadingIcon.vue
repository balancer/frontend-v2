<template>
  <div :class="['spinner', sizeClasses]">
    <div :class="`spinner-double-bounce1 ${colorClasses}`" />
    <div :class="`spinner-double-bounce2 ${colorClasses}`" />
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalLoadingIcon',

  props: {
    color: {
      type: String,
      default: 'gray',
      validator: value => ['gray', 'primary', 'white'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    }
  },

  setup(props) {
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'lg':
          return 'spinner-lg';
        case 'sm':
          return 'spinner-sm';
        default:
          return 'spinner-md';
      }
    });

    const colorClasses = computed(() => {
      switch (props.color) {
        case 'white':
          return 'bg-white';
        default:
          return `bg-${props.color}-500`;
      }
    });

    return {
      sizeClasses,
      colorClasses
    };
  }
});
</script>

<style>
.spinner {
  position: relative;
}

.spinner-sm {
  width: 16px;
  height: 16px;
}

.spinner-md {
  width: 22px;
  height: 22px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
}

.spinner-double-bounce1,
.spinner-double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-animation: sk-bounce 2s infinite ease-in-out;
  animation: sk-bounce 2s infinite ease-in-out;
}
.spinner-double-bounce2 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}
@-webkit-keyframes sk-bounce {
  0%,
  100% {
    -webkit-transform: scale(0);
  }
  50% {
    -webkit-transform: scale(1);
  }
}
@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  50% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}
</style>
