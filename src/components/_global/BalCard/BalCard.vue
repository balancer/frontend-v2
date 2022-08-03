<template>
  <div :class="['bal-card', cardClasses]">
    <div
      :class="[
        'card-container',
        { 'overflow-y-scroll max-h-screen': overflowYScroll },
      ]"
    >
      <div v-if="imgSrc" class="feature" :style="featureStyles" />
      <div v-if="!!title || $slots.header" :class="['header', headerClasses]">
        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- Not sure if this is fine -->
        <component :is="titleTag" v-if="!!title" v-text="title" />
        <div
          v-if="$slots.header"
          :class="['header-content', headerContentClasses]"
        >
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'BalCard',

  props: {
    title: { type: String, default: '' },
    titleTag: { type: String, default: 'h4' },
    square: { type: Boolean, default: false },
    noPad: { type: Boolean, default: false },
    noContentPad: { type: Boolean, default: false },
    noBorder: { type: Boolean, default: false },
    darkBgColor: { type: String, default: '850' },
    imgSrc: { type: String, default: '' },
    hFull: { type: Boolean, default: false },
    growContent: { type: Boolean, default: false },
    rightAlignHeader: { type: Boolean, default: false },
    exposeOverflow: { type: Boolean, default: false },
    overflowYScroll: { type: Boolean, default: false },
    shadow: {
      type: String,
      default: '',
      validator: (val: string): boolean => {
        return [
          '',
          'none',
          'sm',
          'md',
          'lg',
          'xl',
          '2xl',
          '3xl',
          '4xl',
        ].includes(val);
      },
    },
  },

  setup(props) {
    const borderClasses = computed(() => {
      return 'border dark:border-gray-900';
    });

    const cardClasses = computed(() => {
      return {
        'rounded-lg': !props.square,
        'overflow-hidden': !props.exposeOverflow,
        [`bg-white dark:bg-gray-${props.darkBgColor}`]: true,
        [`shadow${props.shadow ? '-' : ''}${props.shadow}`]: true,
        [borderClasses.value]: !props.noBorder,
        'h-full': props.hFull,
      };
    });

    const headerClasses = computed(() => {
      return {
        'p-4 pb-0': !props.noPad,
      };
    });

    const headerContentClasses = computed(() => {
      return {
        'justify-end': props.rightAlignHeader,
      };
    });

    const contentClasses = computed(() => {
      return {
        'p-4': !props.noPad && !props.noContentPad,
        'flex-grow': props.growContent,
      };
    });

    const footerClasses = computed(() => {
      return {
        'rounded-b-lg': !props.square,
        'p-4 pt-0': !props.noPad,
      };
    });

    const featureStyles = computed(() => ({
      backgroundImage: `url('${props.imgSrc}')`,
    }));

    return {
      cardClasses,
      contentClasses,
      headerClasses,
      headerContentClasses,
      footerClasses,
      featureStyles,
    };
  },
});
</script>

<style scoped>
.bal-card {
  @apply flex flex-col;
}

.card-container {
  @apply flex flex-col;
}

.card-container::-webkit-scrollbar {
  width: 0;
}

.header {
  @apply flex items-center;
}

.header-content {
  @apply flex-1 flex items-center;
}

.footer {
  @apply flex items-center;
}

.feature {
  @apply w-full h-40 bg-center bg-cover;
}
</style>
