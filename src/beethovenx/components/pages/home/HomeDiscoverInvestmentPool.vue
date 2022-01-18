<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import usePools from '@/composables/pools/usePools';
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
//import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import { Pool } from '@/services/balancer/subgraph/types';
import { useRouter } from 'vue-router';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

const { fNum } = useNumbers();
const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();
const { poolsWithFarms, isLoadingPools, isLoadingFarms } = usePools();
const router = useRouter();
const featuredPools = computed(() => {
  const mapped = beethovenxConfig.value.homeFeaturedPools
    .filter(data => poolsWithFarms.value.find(pool => pool.id === data.poolId))
    .map(data => {
      return {
        data,
        pool: poolsWithFarms.value.find(pool => pool.id === data.poolId)
      };
    });

  return mapped.slice(0, 4);
});

const isLoading = computed(
  () =>
    beethovenxConfigLoading.value ||
    isLoadingPools.value ||
    isLoadingFarms.value
);

function handleRowClick(pool: Pool) {
  router.push({ name: 'pool', params: { id: pool.id } });
}
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    v-if="!isLoading"
  >
    <router-link
      v-for="featuredPool in featuredPools"
      :key="featuredPool.data.poolId"
      :to="{ name: 'pool', params: { id: featuredPool.data.poolId } }"
      class="block flex"
    >
      <BalCard
        :img-src="featuredPool.data.image"
        @click="handleRowClick(featuredPool.pool)"
        class="cursor-pointer flex-1"
      >
        <div class="text-xl font-medium">
          {{ featuredPool.pool.name }}
        </div>
        <div class="mt-2 mb-6 flex-1 whitespace-pre-line">
          {{ featuredPool.data.description }}
        </div>
        <template v-slot:footer>
          <div>
            <BalAssetSet
              :addresses="featuredPool.pool.tokensList"
              :size="40"
              :width="150"
            />
            <div class="text-xl font-medium truncate flex items-center mt-4">
              {{ fNum(featuredPool.pool.dynamic.apr.total, 'percent') }} APR
              <!--              <LiquidityMiningTooltip :pool="featuredPool.pool" />-->
            </div>
            <div class="text-sm text-gray-500">
              {{ fNum(featuredPool.pool.dynamic.apr.total / 365, 'percent') }}
              DAILY
            </div>
          </div>
        </template>
      </BalCard>
    </router-link>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" v-else>
    <BalLoadingBlock v-for="n in 4" :key="n" class="h-96" />
  </div>
</template>
