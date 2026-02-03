<script setup lang="ts">
/**
 * veBAL page
 */
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import CrossChainBoostCards from '@/components/contextual/pages/vebal/cross-chain-boost/CrossChainBoostCards.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';

import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import MyVebalInfo from '@/components/contextual/pages/vebal/MyVebalInfo.vue';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
providePoolStaking();
</script>

<template>
  <div>
    <MyVebalInfo v-if="isVeBalSupported" v-once />

    <div
      class="xl:container py-16 xl:py-20 lg:mx-auto bg-gray-50 dark:bg-gray-850/50"
    >
      <div v-if="isVeBalSupported" class="lg:mx-auto max-w-5xl">
        <div class="px-4 mb-8">
          <MyVeBAL />
        </div>
        <div>
          <CrossChainBoostCards />
        </div>
      </div>
    </div>
  </div>
</template>
