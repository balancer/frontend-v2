<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { useLock } from '@/composables/useLock';
import { isL2 } from '@/composables/useNetwork';
import { PoolWithShares } from '@/services/pool/types';

/** COMPOSABLES */
const {
  isLoadingLockPool,
  isLoadingLockInfo,
  lockPool,
  lock,
  lockedFiatTotal
} = useLock();

const { t } = useI18n();

/** COMPUTED */
const isLoading = computed(() => {
  return isLoadingLockPool.value || isLoadingLockInfo.value;
});

const lockPools = computed<PoolWithShares[]>(() => {
  if (lockPool.value) {
    return [
      {
        ...lockPool.value,
        bpt: '',
        shares: lockedFiatTotal.value,
        lockedEndDate:
          lock.value?.hasExistingLock && !lock.value?.isExpired
            ? lock.value?.lockedEndDate
            : undefined
      }
    ];
  }
  return [];
});

const hiddenColumns = computed(() => {
  const _hiddenColumns = [
    'poolVolume',
    'poolValue',
    'migrate',
    'actions',
    'myBoost'
  ];
  if (isL2.value) _hiddenColumns.push('myBoost');
  return _hiddenColumns;
});
</script>

<template>
  <!-- TODO: Move lock pools datafetching to parent -->
  <div class="mt-8" v-if="lockPools.length">
    <BalStack vertical spacing="sm">
      <h5 class="px-4 lg:px-0">{{ $t('veBalProtocolLiquidity') }}</h5>
      <PoolsTable
        :key="lockPools"
        :data="lockPools"
        :hiddenColumns="hiddenColumns"
        :isLoading="isLoading"
        showPoolShares
      />
    </BalStack>
  </div>
</template>
