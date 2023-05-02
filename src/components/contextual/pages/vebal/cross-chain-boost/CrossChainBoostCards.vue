<script setup lang="ts">
/**
 * veBAL page
 */
import Hero from '@/components/contextual/pages/vebal/Hero.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <div>
    <h3 class="mb-3">
      {{ $t('crossChainBoost.title') }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <template v-if="isLoading">
        <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
      </template>
      <MyVeBalCards
        v-else-if="lockPool && lockPoolToken"
        :veBalLockInfo="lock"
        :lockablePool="lockPool"
        :lockablePoolTokenInfo="lockPoolToken"
        :totalLockedValue="totalLockedValue"
      />
    </div>
  </div>
</template>
