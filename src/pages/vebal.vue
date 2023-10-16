<script setup lang="ts">
/**
 * veBAL page
 */
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import CrossChainBoostCards from '@/components/contextual/pages/vebal/cross-chain-boost/CrossChainBoostCards.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';

import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import MyVebalInfo from '@/components/contextual/pages/vebal/MyVebalInfo.vue';
import { provideVoting } from '@/components/contextual/pages/vebal/providers/voting.provider';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
providePoolStaking();
provideVoting();
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
    <div
      v-if="isVeBalSupported"
      class="xl:container lg:px-4 xl:px-0 pt-16 xl:pt-20 xl:mx-auto"
    >
      <div class="xl:px-0 mb-16">
        <LMVoting />
      </div>
    </div>
    <div v-else class="text-center">
      <div class="text-lg font-semibold">
        {{ $t('veBAL.notSupported.title') }}
      </div>
      <div>{{ $t('veBAL.notSupported.description') }}</div>
    </div>
  </div>
</template>
