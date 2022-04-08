<script setup lang="ts">
import { FullPool } from '@/services/balancer/subgraph/types';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import useNumbers from '@/composables/useNumbers';
import { useRouter } from 'vue-router';
import { orderedTokenAddressesFor } from '@/composables/usePool';

type Props = {
  pools: FullPool[];
  isLoading: boolean;
};

const router = useRouter();
const props = defineProps<Props>();

const { fNum } = useNumbers();

function navigateToPool(pool: FullPool) {
  router.push({
    name: 'pool',
    params: { id: pool.id }
  });
}
</script>

<template>
  <div
    class="grid grid-cols-1 grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 mb-12"
  >
    <template v-if="props.isLoading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-44" />
    </template>
    <template v-else>
      <BalCard
        v-for="pool in props.pools"
        :key="pool.id"
        class="col col-span-1 cursor-pointer"
        @click="navigateToPool(pool)"
      >
        <div class="text-gray-500 font-medium mb-4 truncate">
          {{ pool.name }}
        </div>
        <BalAssetSet
          :addresses="orderedTokenAddressesFor(pool)"
          :size="40"
          :width="150"
        />
        <!--        <div class="font-medium truncate flex items-center mt-2 text-gray-500">
          {{ topPerformer.name }}
        </div>-->
        <div class="text-xl font-medium truncate flex items-center mt-4">
          {{ fNum(pool.apr.total, 'percent') }} APR
          <LiquidityAPRTooltip :pool="pool" />
        </div>
        <div class="text-sm text-gray-500">
          {{ fNum(pool.apr.total / 365, 'percent') }} DAILY
        </div>
      </BalCard>
    </template>
  </div>
</template>
