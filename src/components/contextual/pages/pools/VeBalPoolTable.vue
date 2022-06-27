<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { useLock } from '@/composables/useLock';
import { isL2 } from '@/composables/useNetwork';
import { bnum } from '@/lib/utils';
import { PoolWithShares } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

/** COMPOSABLES */
const { isLoadingLockPool, isLoadingLockInfo, lockPool, lock } = useLock();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();

/** COMPUTED */
const isLoading = computed(() => {
  return isLoadingLockPool.value || isLoadingLockInfo.value;
});

const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noStakedInvestments')
    : t('connectYourWallet');
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
            : null
      }
    ];
  }
  return [];
});

const poolShares = computed(() =>
  bnum(lockPool.value?.totalLiquidity || '').div(
    lockPool.value?.totalShares || ''
  )
);

const lockedFiatTotal = computed(() =>
  lock.value?.hasExistingLock
    ? poolShares.value.times(lock.value.lockedAmount).toString()
    : '0'
);

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
        :noPoolsLabel="noPoolsLabel"
        :hiddenColumns="hiddenColumns"
        :isLoading="isLoading"
        showPoolShares
      />
    </BalStack>
  </div>
</template>
