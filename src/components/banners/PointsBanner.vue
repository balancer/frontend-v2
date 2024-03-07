<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import { usePoints } from '@/composables/usePoints';
import { Protocol, protocolIconPaths } from '@/composables/useProtocols';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

const props = defineProps<Props>();

const { hasPoints, poolPoints } = usePoints(props.pool);

function getIconSrc(protocol: Protocol) {
  return protocolIconPaths[protocol];
}
</script>

<template>
  <div v-if="hasPoints" class="points-banner">
    <span class="pb-3 sm:pb-0 leading-5"
      >Liquidity providers in this pool also earn partner points</span
    >
    <div class="flex">
      <div
        v-for="{ protocol, multiple } in poolPoints"
        :key="protocol"
        class="flex justify-center items-center py-2 px-3 ml-2 text-white rounded-full border border-gray-700 backdrop-blur-sm bg-black/20"
      >
        <BalAsset
          :iconURI="getIconSrc(protocol)"
          :alt="protocol"
          class="mr-2"
        />
        {{ multiple }}x
      </div>
    </div>
  </div>
</template>

<style scoped>
.points-banner {
  @apply flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-4 mb-6 w-full font-bold text-white rounded-lg relative overflow-hidden sm:gap-8;
}

.points-banner::before {
  content: ' ';
  background-image: url('/images/banners/points-banner.jpg');
  background-position-y: top;
  @apply block absolute left-0 top-0 w-full h-full -z-10 bg-cover bg-no-repeat;
}
</style>
