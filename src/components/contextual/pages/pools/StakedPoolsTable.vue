<script setup lang="ts">
import { computed, ref } from 'vue';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import useStaking from '@/composables/staking/useStaking';
import { isL2 } from '@/composables/useNetwork';
import { FullPool } from '@/services/balancer/subgraph/types';

import StakePreviewModal from '../../stake/StakePreviewModal.vue';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  userData: {
    stakedPools,
    isLoadingUserStakingData,
    isLoadingStakedPools,
    isLoadingUserPools,
    isUserPoolsIdle,
    poolBoosts
  },
  setPoolAddress
} = useStaking();

/** COMPUTED */
const isLoading = computed(() => {
  return (
    isLoadingUserStakingData.value ||
    isLoadingStakedPools.value ||
    isLoadingUserPools.value ||
    isUserPoolsIdle.value
  );
});

const poolsWithBoost = computed(() => {
  return stakedPools.value.map(pool => ({
    ...pool,
    boost: (poolBoosts.value || {})[pool.id]
  }));
});

const hiddenColumns = computed(() => {
  const _hiddenColumns = ['poolVolume', 'poolValue', 'migrate', 'stake'];
  if (isL2.value) _hiddenColumns.push('myBoost');
  return _hiddenColumns;
});

/** METHODS */
function handleStake(pool: FullPool) {
  setPoolAddress(pool.address);
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  showStakeModal.value = false;
}
</script>

<template>
  <div class="mt-8">
    <BalStack vertical spacing="sm">
      <h5 class="px-4 lg:px-0">{{ $t('staking.stakedPools') }}</h5>
      <PoolsTable
        :key="poolsWithBoost"
        :data="poolsWithBoost"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="hiddenColumns"
        @triggerStake="handleStake"
        :isLoading="isLoading"
        showPoolShares
        showBoost
      />
    </BalStack>
  </div>
  <StakePreviewModal
    :pool="stakePool"
    :isVisible="showStakeModal"
    @close="handleModalClose"
    action="stake"
  />
</template>
