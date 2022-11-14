<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  token: PoolToken;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { explorerLinks } = useWeb3();

//TODO:
const balanceLabel = '9999999999';
</script>

<template>
  <div class="w-full">
    <BalLink
      :href="explorerLinks.addressLink(token.address)"
      external
      noStyle
      class="flex items-center"
    >
      <BalAsset :address="token.address" class="mr-2" />
      {{ token?.symbol || '---' }}
      <BalIcon
        name="arrow-up-right"
        size="sm"
        class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
      />
    </BalLink>

    <div class="flex flex-col mt-4 ml-3">
      <div
        v-for="(nestedToken, i) in token.token?.pool?.tokens"
        :key="nestedToken.address"
        :class="['flex items-center', { 'mt-4': i !== 0 }]"
      >
        <!-- <div v-if="i === 0" class="-mt-6 h-6 init-vert-bar" />
        <div v-else class="-mt-16 h-16 vert-bar" /> -->
        <div class="-mt-16 h-16 vert-bar" />
        <div class="horiz-bar" />

        <div class="flex-grow">
          <TokenBreakdown :token="nestedToken" />
          <div class="justify-self-end">
            {{ balanceLabel }}
          </div>
          <!-- <div class="justify-self-end">
              {{ fiatLabel }}
            </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.horiz-bar {
  @apply h-px w-3 bg-gray-200 dark:bg-gray-700 mr-2;
}

.init-vert-bar {
  @apply w-px bg-gray-200 dark:bg-gray-700 -mr-px;
}

.vert-bar {
  @apply w-px bg-gray-200 dark:bg-gray-700 -mr-px;
}
</style>
