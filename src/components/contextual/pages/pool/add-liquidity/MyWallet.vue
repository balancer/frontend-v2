<script setup lang="ts">
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import { useMyWallet } from './composables/useMyWallet';

/**
 * COMPOSABLES
 */
const { handleMyWalletTokenClick, isLoadingPool, pool, excludedTokens } =
  useMyWallet();
</script>

<template>
  <BalLoadingBlock v-if="isLoadingPool || !pool" class="h-64" />
  <MyWallet
    v-else
    :excludedTokens="excludedTokens"
    :pool="pool"
    @click:asset="handleMyWalletTokenClick"
  />
</template>
