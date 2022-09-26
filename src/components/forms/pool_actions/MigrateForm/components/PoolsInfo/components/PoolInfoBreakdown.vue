<script setup lang="ts">
import { computed, ref } from 'vue';

import useTokens from '@/composables/useTokens';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';
import { POOL_MIGRATIONS_MAP } from '../../../constants';

type Props = {
  pool: Pool;
  poolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const isExpanded = ref(false);

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const showOldVHint = computed(
  () => POOL_MIGRATIONS_MAP[props.pool.id]?.showOldVHint
);
</script>

<template>
  <div class="p-3 dark:bg-gray-800 rounded-lg border dark:border-gray-800">
    <BalBreakdown
      :items="pool.tokensList"
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
          <div class="font-semibold">
            {{ poolTokenInfo.symbol }}
            <span v-if="showOldVHint">
              ({{ $t('migratePool.oldVersion') }})
            </span>
          </div>

          <div class="text-sm text-secondary">
            {{ poolTokenInfo.name }}
          </div>
        </div>
      </div>
      <template #item="{ item: address }">
        <div
          class="inline-flex items-center py-1 px-2 ml-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-800"
        >
          <BalAsset :address="address" class="mr-2" />
          {{ getToken(address).symbol }}
        </div>
      </template>
    </BalBreakdown>
  </div>
</template>
