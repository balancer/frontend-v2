<template>
  <template
    v-for="(addressesChunk, addressChunkIndex) in addressesChunks"
    :key="addressChunkIndex"
  >
    <div
      class="addresses-row"
      :style="{
        width: `${width}px`,
        height: `${size}px`
      }"
    >
      <BalAsset
        v-for="(address, i) in addressesChunk"
        :key="i"
        :address="address"
        :size="size"
        @click="$emit('click', address)"
        :class="['token-icon', { absolute: !wrap, relative: wrap }]"
        :style="{
          left: `${leftOffsetFor(i)}px`,
          zIndex: `${20 - i}`,
          width: `${size}px`,
          height: `${size}px`
        }"
      />
    </div>
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { chunk } from 'lodash';

import BalAsset from './BalAsset.vue';

export default defineComponent({
  components: {
    BalAsset
  },
  emits: ['click'],
  props: {
    addresses: {
      type: Array as PropType<string[]>,
      required: true
    },
    width: {
      type: Number,
      default: 200
    },
    size: {
      type: Number,
      default: 26
    },
    maxAssetsPerLine: {
      type: Number,
      default: 8
    },
    wrap: {
      type: Boolean
    }
  },

  setup(props) {
    /**
     * COMPUTED
     */
    const addressesChunks = computed(() =>
      chunk(props.addresses, props.maxAssetsPerLine)
    );

    const radius = computed(() => props.size / 2);

    const spacer = computed(
      () =>
        (props.maxAssetsPerLine / props.addresses.length - 1) *
        (radius.value * 2)
    );

    /**
     * METHODS
     */
    function leftOffsetFor(i: number) {
      if (props.wrap) return 0;
      return (
        ((props.width - radius.value * 2 + spacer.value) /
          (props.maxAssetsPerLine - 1)) *
        i
      );
    }

    return {
      // computed
      addressesChunks,

      // methods
      leftOffsetFor
    };
  }
});
</script>

<style scoped>
.addresses-row {
  @apply relative mb-3;
}
.addresses-row:last-child {
  @apply mb-0;
}
.token-icon {
  margin-left: -2px;
  @apply rounded-full overflow-hidden shadow-none;
  @apply bg-white dark:bg-gray-850;
  @apply border-2 border-white dark:border-gray-850 group-hover:border-gray-50 dark:group-hover:border-gray-800;
}
</style>
