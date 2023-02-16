<script setup lang="ts">
import { computed } from 'vue';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { useLock } from '@/composables/useLock';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool } from '@/services/pool/types';

/**
 * PROPS
 */
type Props = {
  lockPool: Pool;
  lock?: VeBalLockInfo;
};
const props = defineProps<Props>();

/** COMPOSABLES */
const { totalLockedShares } = useLock();

/** COMPUTED */
const lockPools = computed<Pool[]>(() => {
  if (props.lockPool) {
    return [
      {
        ...props.lockPool,
        lockedEndDate:
          props.lock?.hasExistingLock && !props.lock?.isExpired
            ? props.lock?.lockedEndDate
            : undefined,
      },
    ];
  }
  return [];
});

const poolShares = computed(
  (): Record<string, string> => ({
    [props.lockPool.id]: totalLockedShares.value,
  })
);

const poolsToRenderKey = computed(() => JSON.stringify(lockPools.value));

const hiddenColumns = ['poolVolume', 'migrate', 'actions', 'myBoost'];
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('veBalProtocolLiquidity') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        :data="lockPools"
        :shares="poolShares"
        :hiddenColumns="hiddenColumns"
        sortColumn="myBalance"
        showPoolShares
      />
    </BalStack>
  </div>
</template>
