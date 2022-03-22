<template>
  <template
    v-for="(assetChunk, assetChunkIndex) in assetChunks"
    :key="assetChunkIndex"
  >
    <div
      :class="['addresses-row', assetRowClasses]"
      :style="{
        width: `${width}px`,
        height: `${size}px`
      }"
    >
      <BalAsset
        v-for="(addressOrURI, i) in assetChunk"
        :key="i"
        v-bind="assetAttrsFor(addressOrURI)"
        :size="size"
        @click="$emit('click', addressOrURI)"
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
import { isAddress } from '@ethersproject/address';

export default defineComponent({
  components: {
    BalAsset
  },
  emits: ['click'],
  props: {
    addresses: {
      type: Array as PropType<string[]>
    },
    logoURIs: {
      type: Array as PropType<string[]>
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
    const hasAddresses = computed(
      (): boolean => !!props.addresses && props.addresses.length > 0
    );
    const hasURIs = computed(
      (): boolean => !!props.logoURIs && props.logoURIs.length > 0
    );

    const assetLength = computed((): number => {
      if (hasAddresses.value) {
        return props.addresses?.length || 0;
      } else if (hasURIs.value) {
        return props.logoURIs?.length || 0;
      } else {
        return 0;
      }
    });

    const assetChunks = computed(() => {
      if (hasAddresses.value) {
        return chunk(props.addresses, props.maxAssetsPerLine);
      } else if (hasURIs.value) {
        return chunk(props.logoURIs, props.maxAssetsPerLine);
      } else {
        return [];
      }
    });

    const assetRowClasses = computed(() => ({
      'mb-3': assetChunks.value.length > 1
    }));

    const radius = computed(() => props.size / 2);

    const spacer = computed(
      () =>
        (props.maxAssetsPerLine / assetLength.value - 1) * (radius.value * 2)
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

    function assetAttrsFor(addressOrURI: string) {
      return isAddress(addressOrURI)
        ? { address: addressOrURI }
        : { iconURI: addressOrURI };
    }

    return {
      // computed
      assetChunks,
      assetRowClasses,

      // methods
      leftOffsetFor,
      assetAttrsFor
    };
  }
});
</script>

<style scoped>
.addresses-row {
  @apply relative flex;
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
