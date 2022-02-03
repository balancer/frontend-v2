<script setup lang="ts">
import { ref } from 'vue';

import { FullPool } from '@/services/balancer/subgraph/types';

import useTokens from '@/composables/useTokens';
import { TokenInfo } from '@/types/TokenList';

type Props = {
  pool: FullPool;
  poolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * STATE
 */
const isExpanded = ref(false);

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
</script>

<template>
  <div class="rounded-lg border dark:border-gray-800 dark:bg-gray-800 p-3">
    <BalBreakdown
      :items="pool.tokenAddresses"
      class="w-full cursor-pointer select-none"
      offsetClassOverrides="mt-4 ml-3"
      initVertBarClassOverrides="h-6 -mt-6"
      size="lg"
      :hideItems="!isExpanded"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center">
        <BalAsset :address="pool.address" class="mr-2" :size="36" />
        <div>
          <div>{{ poolTokenInfo.symbol }}</div>
          <div class="text-gray-500">
            {{ poolTokenInfo.name }}
          </div>
        </div>
      </div>
      <template #item="{ item: address }">
        <div
          class="ml-2 rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-700 px-2 py-1 inline-flex items-center"
        >
          <BalAsset :address="address" class="mr-2" />
          {{ tokens[address].symbol }}
        </div>
      </template>
    </BalBreakdown>
  </div>
</template>
