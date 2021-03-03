<template>
  <div :class="['bal-card', cardClasses]">
    <div :class="['header', headerClasses]">
      <component :is="titleTag" v-if="!!title" v-text="title" />
      <div v-if="$slots.header" class="flex-1">
        <slot name="header" />
      </div>
    </div>
    <div :class="['content', contentClasses]">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="['footer', footerClasses]">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalCard',

  props: {
    title: { type: String, default: '' },
    titleTag: { type: String, default: 'h3' },
    square: { type: Boolean, default: false },
    noPad: { type: Boolean, default: false },
    shadowSize: {
      type: String,
      default: '',
      validator: (val: string): boolean => {
        return ['', '-none', '-sm', '-md', '-lg', '-xl', '-2xl'].includes(val);
      }
    }
  },

  computed: {
    cardClasses(): Record<string, boolean> {
      return {
        rounded: !this.square,
        [`shadow${this.shadowSize}`]: true
      };
    },

    contentClasses(): Record<string, boolean> {
      return {
        'p-4 pt-3': !this.noPad
      };
    },

    headerClasses(): Record<string, boolean> {
      return {
        'p-4 pb-3': !this.noPad
      };
    },

    footerClasses(): Record<string, boolean> {
      return {
        'p-4': !this.noPad,
        'rounded-b': !this.square
      };
    }
  }
});
</script>

<style scoped>
.bal-card {
  @apply bg-white dark:bg-gray-900;
  @apply border-0 dark:border dark:border-gray-700;
}

.header {
  @apply flex items-center;
}

.footer {
  @apply flex items-center;
  @apply bg-gray-50 dark:bg-gray-800;
  @apply border-t border-gray-100 dark:border-gray-700;
}
</style>
