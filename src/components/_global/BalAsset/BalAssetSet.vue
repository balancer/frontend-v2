<template>
  <div
    class="relative"
    :style="{
      width: `${width}px`,
      height: `${size}px`
    }"
  >
    <BalAsset
      v-for="(address, i) in addresses"
      :key="i"
      :address="address"
      :size="size"
      class="token-icon"
      :style="{
        left: `${leftOffsetFor(i)}px`,
        zIndex: `${20 - i}`,
        width: `${size}px`,
        height: `${size}px`
      }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BalAsset from './BalAsset.vue';

export default defineComponent({
  components: {
    BalAsset
  },

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
    }
  },

  setup(props) {
    function leftOffsetFor(i: number): number {
      const maxCount = 8;
      const radius = props.size / 2;
      const spacer = (maxCount / props.addresses.length - 1) * (radius * 2);
      return ((props.width - radius * 2 + spacer) / (maxCount - 1)) * i;
    }

    return { leftOffsetFor };
  }
});
</script>

<style scoped>
.token-icon {
  margin-left: -2px;
  @apply absolute rounded-full overflow-hidden shadow-none;
  @apply bg-white dark:bg-gray-850;
  @apply border-2 border-white dark:border-gray-850 group-hover:border-gray-50 dark:group-hover:border-gray-800;
}
</style>
