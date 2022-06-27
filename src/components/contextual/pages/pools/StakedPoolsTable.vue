<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import useStaking from '@/composables/staking/useStaking';
import { isL2 } from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';

/** COMPOSABLES */
const {
  userData: {
    stakedPools,
    isLoadingUserStakingData,
    isLoadingStakedPools,
    isLoadingUserPools,
    poolBoosts
  }
} = useStaking();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();

/** COMPUTED */
const isLoading = computed(() => {
  return (
    isLoadingUserStakingData.value ||
    isLoadingStakedPools.value ||
    isLoadingUserPools.value
  );
});

const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noStakedInvestments')
    : t('connectYourWallet');
});

const poolsWithBoost = computed(() => {
  return stakedPools.value.map(pool => ({
    ...pool,
    boost: (poolBoosts.value || {})[pool.id]
  }));
});

const hiddenColumns = computed(() => {
  const _hiddenColumns = [
    'poolVolume',
    'poolValue',
    'migrate',
    'actions',
    'lockedEndDate'
  ];
  if (isL2.value) _hiddenColumns.push('myBoost');
  return _hiddenColumns;
});
</script>

<template>
  <div class="mt-8">
    <BalStack vertical spacing="sm">
      <h5 class="px-4 lg:px-0">{{ $t('staking.stakedPools') }}</h5>
      <PoolsTable
        :key="poolsWithBoost"
        :data="poolsWithBoost"
        :noPoolsLabel="noPoolsLabel"
        :hiddenColumns="hiddenColumns"
        :isLoading="isLoading"
        showPoolShares
        showBoost
      />
    </BalStack>
  </div>
</template>
