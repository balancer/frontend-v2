<template>
  <template
    v-for="(assetChunk, assetChunkIndex) in assetChunks"
    :key="assetChunkIndex"
  >
    <div
      :class="['addresses-row', assetRowClasses]"
      v-bind="$attrs"
      :style="{
        width: `${width}px`,
        height: `${size}px`,
      }"
    >
      <BalAsset
        v-for="(addressOrURI, i) in assetChunk"
        :key="i"
        v-bind="{ ...assetAttrsFor(addressOrURI), ...balAssetProps }"
        :size="size"
        :class="[
          'token-icon ring-2 ring-white dark:ring-gray-800 group-hover:ring-gray-50 dark:group-hover:ring-gray-800',
          { absolute: !wrap, relative: wrap },
        ]"
        :style="getBalAssetStyle(assetChunkIndex, i)"
        @click="$emit('click', addressOrURI)"
      />
    </div>
  </template>
</template>

<script lang="ts">
import { isAddress } from '@ethersproject/address';
import { chunk } from 'lodash';
import { computed, defineComponent, PropType } from 'vue';

import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

type BalAssetProps = {
  address?: string;
  iconURI?: string;
  size?: number;
  button?: boolean;
  disabled?: boolean;
};

export default defineComponent({
  components: {
    BalAsset,
  },
  props: {
    addresses: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    disabledAddresses: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    logoURIs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    balAssetProps: {
      type: Object as PropType<BalAssetProps>,
      default: () => ({}),
    },
    width: {
      type: Number,
      default: 200,
    },
    size: {
      type: Number,
      default: 26,
    },
    maxAssetsPerLine: {
      type: Number,
      default: 8,
    },
    wrap: {
      type: Boolean,
    },
  },
  emits: ['click'],

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
      'mb-3': assetChunks.value.length > 1,
    }));

    const radius = computed(() => props.size / 2);
    const smallSetSpacer = computed(() =>
      props.addresses.length < 4 ? 30 : 0
    );

    const spacer = computed(
      () =>
        (props.maxAssetsPerLine / assetLength.value - 1) * (radius.value * 2) +
        smallSetSpacer.value
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

    function assetAttrsFor(addressOrURI: string): BalAssetProps {
      const addressOrURIProp = isAddress(addressOrURI)
        ? { address: addressOrURI }
        : { iconURI: addressOrURI };
      return {
        ...addressOrURIProp,
        disabled: props.disabledAddresses.includes(addressOrURI),
      };
    }

    function getBalAssetStyle(assetRowIndex: number, assetIndex: number) {
      return {
        left: `${leftOffsetFor(assetIndex)}px`,
        zIndex: `${20 - assetIndex}`,
        // After the first three rows, display any remaining tokens smaller to fit more in
        width: `${assetRowIndex > 2 ? '24' : props.size}px`,
        height: `${assetRowIndex > 2 ? '24' : props.size}px`,
      };
    }

    return {
      // computed
      assetChunks,
      assetRowClasses,

      // methods
      leftOffsetFor,
      assetAttrsFor,
      getBalAssetStyle,
    };
  },
});
</script>

<style scoped>
.addresses-row {
  @apply relative flex z-0;
}

.token-icon {
  margin-left: -2px;

  @apply rounded-full overflow-hidden shadow-none;
  @apply bg-white dark:bg-gray-850;
}

.my-wallet .token-icon {
  @apply ml-0;
}

.my-wallet .addresses-row {
  @apply flex-wrap gap-2;

  width: auto !important;
  height: auto !important;
}

.my-wallet .addresses-row > img,
.my-wallet .addresses-row > .token-icon {
  @apply border-0;
}

.addresses-row:last-child {
  @apply mb-0;
}
</style>
