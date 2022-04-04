<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { Pool } from '@/services/balancer/subgraph/types';
import { useRouter } from 'vue-router';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import usePoolList from '@/beethovenx/composables/usePoolList';

const { fNum } = useNumbers();
const { homeFeaturedPools, poolListLoading } = usePoolList();
const router = useRouter();
const isLoading = computed(() => poolListLoading.value);

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
      v-for="featuredPool in homeFeaturedPools"
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
              {{ fNum(featuredPool.pool.apr.total, 'percent') }} APR
              <LiquidityAPRTooltip :pool="featuredPool.pool" />
            </div>
            <div class="text-sm text-gray-500">
              {{ fNum(featuredPool.pool.apr.total / 365, 'percent') }}
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
