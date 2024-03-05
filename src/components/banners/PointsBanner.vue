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

const { hasPoints, poolPoints, tokenPointMultiples } = usePoints(props.pool);

function getIconSrc(protocol: Protocol) {
  return protocolIconPaths[protocol];
}
</script>

<template>
  <div
    v-if="hasPoints"
    class="flex justify-between items-center p-4 mb-4 w-full font-bold text-black bg-yellow-500 rounded-lg"
  >
    <span>Liquidity providers in this pool also earn partner points</span>
    <div class="flex">
      <div
        v-for="{ protocol, multiple } in poolPoints"
        :key="protocol"
        class="flex justify-center items-center py-2 px-3 mr-2 text-white bg-black rounded-full"
      >
        <BalAsset
          :iconURI="getIconSrc(protocol as Protocol)"
          :alt="protocol"
          class="mr-2"
        />
        {{ multiple }}x
      </div>
      <div
        v-for="(multiple, tokenAddress) in tokenPointMultiples"
        :key="tokenAddress"
        class="flex justify-center items-center py-2 px-3 ml-2 text-white bg-black rounded-full"
      >
        <BalAsset :address="tokenAddress" class="mr-2" />
        {{ multiple }}x
      </div>
    </div>
  </div>
</template>
