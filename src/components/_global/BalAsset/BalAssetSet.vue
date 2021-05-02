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
      class="z-10 absolute"
      :style="{
        left: `${leftOffsetFor(i)}px`
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
      default: 24
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
