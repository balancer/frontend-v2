<script setup lang="ts">
import { computed, ref } from 'vue';

import useStaking from '@/composables/staking/useStaking';

import { FullPool } from '@/services/balancer/subgraph/types';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
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
    dynamic: {
      ...pool.dynamic,
      boost: poolBoosts.value[pool.id]
    }
  }));
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
      <h5>{{ $t('staking.stakedPools') }}</h5>
      <PoolsTable
        :key="poolsWithBoost"
        :data="poolsWithBoost"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate', 'stake']"
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
