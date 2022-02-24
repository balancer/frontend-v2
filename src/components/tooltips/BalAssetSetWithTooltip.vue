<template>
  <template
    v-for="(addressesChunk, addressChunkIndex) in addressesChunks"
    :key="addressChunkIndex"
  >
    <BalTooltip width="auto" noPad rightPad :distance="30" placement="right">
      <template v-slot:activator>
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
            :class="[
              'token-icon',
              'cursor-pointer',
              { absolute: !wrap, relative: wrap }
            ]"
            :style="{
              left: `${leftOffsetFor(i)}px`,
              zIndex: `${20 - i}`,
              width: `${size}px`,
              height: `${size}px`
            }"
          />
        </div>
      </template>
      <div class="text-sm divide-y dark:divide-gray-900">
        <div class="p-3">
          <div v-for="(item, idx) in tokens" :key="idx">
            <div class="whitespace-nowrap flex items-center mb-1">
              <template v-if="!!item.weight">
                {{ fNum(item.weight, 'percent') }}</template
              >
              <span class="ml-1 text-gray-500 text-xs">
                <BalAsset :address="item.address" :size="16" />
                {{ item.symbol }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BalTooltip>
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { chunk } from 'lodash';
import useNumbers from '@/composables/useNumbers';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

import BalAsset from '../_global/BalAsset/BalAsset.vue';

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
    },
    maxAssetsPerLine: {
      type: Number,
      default: 8
    },
    wrap: {
      type: Boolean
    },
    pool: {
      type: Object as PropType<DecoratedPool>
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

    const tokens = computed(() =>
      props.pool?.tokens.filter(token => token.address !== props.pool?.address)
    );

    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();

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
      tokens,

      // methods
      leftOffsetFor,

      // composables
      fNum
    };
  }
});
</script>

<style scoped>
.addresses-row {
  @apply relative mb-3 flex;
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
