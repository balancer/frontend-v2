<template>
  <div class="border-t border-b md:border-r md:border-l block-bg mb-2 shadow">
    <h4
      v-if="title"
      class="px-5 pb-2 pt-3 border-b block bg-gray-dark md:rounded-t-md"
    >
      {{ title }}
      <UiCounter v-if="counter" :counter="counter" class="ml-1" />
      <a
        v-if="icon"
        @click="$emit('submit')"
        class="float-right text-gray"
        style="padding-top: 2px;"
      >
        <Icon :name="icon" size="22" />
      </a>
    </h4>
    <div :class="!slim && 'px-0 md:px-8 py-10'">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'counter', 'slim', 'icon']
};
</script>
