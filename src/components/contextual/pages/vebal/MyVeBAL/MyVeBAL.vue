<script setup lang="ts">
import { computed } from 'vue';

import { useLock } from '@/composables/useLock';
import useWeb3 from '@/services/web3/useWeb3';

import MyVeBalCards from './components/MyVeBalCards.vue';

/**
 * COMPOSABLES
 */
const {
  isLoadingLockPool,
  isLoadingLockInfo,
  lockPool,
  lockPoolToken,
  lock,
  lockedFiatTotal,
} = useLock();
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */

const isLoading = computed(() =>
  isWalletReady.value
    ? isLoadingLockPool.value || isLoadingLockInfo.value
    : false
);
</script>

<template>
  <h3 class="mb-3">
    {{ $t('veBAL.myVeBAL.title') }}
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
      :lockedFiatTotal="lockedFiatTotal"
    />
  </div>
</template>
