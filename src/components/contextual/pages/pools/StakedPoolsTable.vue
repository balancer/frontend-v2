<script setup lang="ts">
import { ref } from 'vue';

import useStaking from '@/composables/staking/useStaking';

import { FullPool } from '@/services/balancer/subgraph/types';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreviewModal from '../../stake/StakePreviewModal.vue';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  stakedPools,
  isLoadingStakingData,
  isLoadingStakedPools,
  setPoolAddress,
  isStakeDataIdle
} = useStaking();

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
        :key="stakedPools"
        :data="stakedPools"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
        @triggerStake="handleStake"
        :isLoading="
          isLoadingStakingData || isStakeDataIdle || isLoadingStakedPools
        "
        showPoolShares
        onlyStakedPct
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
