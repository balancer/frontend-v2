<script lang="ts" setup>
type Props = {
  isOneColumn?: boolean;
};

withDefaults(defineProps<Props>(), { isOneColumn: false });
</script>

<template>
  <div class="px-4 lg:px-0 mx-auto max-w-6xl">
    <div
      v-if="!isOneColumn"
      class="grid grid-cols-1 lg:grid-cols-10 gap-x-8 g:gap-x-8 gap-y-8"
    >
      <Transition>
        <div class="lg:col-span-4">
          <slot name="left" />
        </div>
      </Transition>

      <div class="lg:col-span-6">
        <slot name="right" />
      </div>
      <slot />
    </div>
    <div v-else class="flex justify-center">
      <div class="w-3/5">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
