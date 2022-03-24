<script setup lang="ts">
import { ref } from 'vue';

import useStaking from '@/composables/staking/useStaking';

import { FullPool } from '@/services/balancer/subgraph/types';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreviewModal from '../../stake/StakePreviewModal.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  stakedPools,
  isLoading: isLoadingStakingData,
  setPoolAddress
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
  <AnimatePresence :isVisible="!isLoadingStakingData && stakedPools.length > 0">
    <div class="mt-8">
      <BalStack vertical spacing="sm">
        <h5>{{ $t('staking.stakedPools') }}</h5>
        <PoolsTable
          :key="stakedPools"
          :data="stakedPools"
          :noPoolsLabel="$t('noInvestments')"
          :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
          @triggerStake="handleStake"
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
  </AnimatePresence>
  <AnimatePresence :isVisible="isLoadingStakingData">
    <div class="mt-8">
      <BalLoadingBlock class="h-32" />
    </div>
  </AnimatePresence>
</template>
