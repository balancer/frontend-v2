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

const isPointsPool = computed(
  () => hasPoints && poolPoints.value.some(p => p.multiple)
);
</script>

<template>
  <div v-if="hasPoints" class="points-banner">
    <span class="pb-3 sm:pb-0 leading-5">{{
      isPointsPool
        ? 'Liquidity providers in this pool also earn partner points'
        : 'Liquidity providers in this pool earn partner rewards'
    }}</span>
    <div class="flex">
      <div
        v-for="{ protocol, multiple, description, url } in poolPoints"
        :key="protocol"
      >
        <BalTooltip placement="bottom" width="64" :disabled="!description">
          <template #activator>
            <component
              :is="url ? 'a' : 'div'"
              class="flex justify-center items-center py-2 px-3 ml-2 text-white rounded-full border border-gray-700 backdrop-blur-sm bg-black/20"
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BalAsset
                :iconURI="getIconSrc(protocol)"
                :alt="protocol"
                :class="{ 'mr-2': multiple }"
              />
              {{ multiple && `${multiple}x` }}
            </component>
          </template>
          <div>
            <div class="mb-2 font-bold">
              <span class="capitalize">{{ protocol }}</span
              >{{ multiple && `: ${multiple}x points multiplier` }}
            </div>
            <div
              v-if="description"
              class="mb-2 list-disc"
              v-html="description"
            />
            <span v-if="multiple">
              This UI does not provide real-time updates on partner point
              multipliers. These points may change or expire and might not
              reflect the most current info, please refer to the partner
              protocol's docs</span
            >
          </div>
        </BalTooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.points-banner {
  @apply flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-4 mb-6 w-full font-bold text-white rounded-lg relative sm:gap-8;
}

.points-banner::before {
  content: ' ';
  background-image: url('/images/banners/points-banner.jpg');
  background-position-y: top;
  @apply block absolute left-0 top-0 w-full h-full -z-10 bg-cover bg-no-repeat rounded-lg;
}
</style>
