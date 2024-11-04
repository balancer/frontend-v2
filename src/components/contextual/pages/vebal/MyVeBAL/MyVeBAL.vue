<script setup lang="ts">
import { computed } from 'vue';

import { useLock } from '@/composables/useLock';

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
  totalLockedValue,
} = useLock();

/**
 * COMPUTED
 */

const isLoading = computed(() => isLoadingLockPool || isLoadingLockInfo.value);
</script>

<template>
  <h3 class="mb-4 font-bold text-center">
    {{ $t('veBAL.myVeBAL.title') }}
  </h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
    <template v-if="isLoading && !(lockPool && lockPoolToken)">
      <BalLoadingBlock v-for="n in 2" :key="n" class="h-24" />
    </template>
    <MyVeBalCards
      v-else-if="lockPool && lockPoolToken"
      :veBalLockInfo="lock"
      :lockablePool="lockPool"
      :lockablePoolTokenInfo="lockPoolToken"
      :totalLockedValue="totalLockedValue"
    />
  </div>
</template>
