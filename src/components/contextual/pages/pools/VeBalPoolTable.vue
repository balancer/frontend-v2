<script setup lang="ts">
import { computed } from 'vue';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { useLock } from '@/composables/useLock';
import { isL2 } from '@/composables/useNetwork';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool, PoolWithShares } from '@/services/pool/types';

/**
 * PROPS & EMITS
 */
type Props = {
  lockPool: Pool;
  lock: VeBalLockInfo;
};
const props = defineProps<Props>();

/** COMPOSABLES */
const { lockedFiatTotal } = useLock();

/** COMPUTED */
const lockPools = computed<PoolWithShares[]>(() => {
  if (props.lockPool) {
    return [
      {
        ...props.lockPool,
        bpt: '',
        shares: lockedFiatTotal.value,
        lockedEndDate:
          props.lock?.hasExistingLock && !props.lock?.isExpired
            ? props.lock?.lockedEndDate
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
  <div class="mt-8">
    <BalStack vertical spacing="sm">
      <h5 class="px-4 lg:px-0">{{ $t('veBalProtocolLiquidity') }}</h5>
      <PoolsTable
        :key="lockPools"
        :data="lockPools"
        :hiddenColumns="hiddenColumns"
        showPoolShares
      />
    </BalStack>
  </div>
</template>
