<script setup lang="ts">
/**
 * veBAL page
 */
import Hero from '@/components/contextual/pages/vebal/Hero.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import CrossChainBoostCards from '@/components/contextual/pages/vebal/cross-chain-boost/CrossChainBoostCards.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';

import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
providePoolStaking();
</script>

<template>
  <div>
    <Hero v-if="isVeBalSupported" v-once />

    <div class="py-16 xl:py-20 bg-gray-50 dark:bg-gray-850/50">
      <div v-if="isVeBalSupported" class="lg:container lg:mx-auto">
        <div class="px-4 mb-5">
          <MyVeBAL />
        </div>
        <div>
          <CrossChainBoostCards />
        </div>
      </div>
    </div>
    <div
      v-if="isVeBalSupported"
      class="xl:container xl:px-4 pt-16 xl:pt-20 xl:mx-auto"
    >
      <div class="xl:px-0 mb-16">
        <!-- <LMVoting /> -->
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
