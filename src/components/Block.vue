<template>
  <div class="block border-t border-b md:border md:rounded-md mb-5 block-bg">
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
    <div :class="!slim && 'p-5'">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'counter', 'slim', 'icon']
};
</script>

<style scoped lang="scss">
.block {
  box-shadow: 0 0 12px -6px var(--border-color);
}
</style>
