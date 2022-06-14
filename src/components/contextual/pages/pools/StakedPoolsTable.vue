<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import useStaking from '@/composables/staking/useStaking';
import { isL2 } from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import StakePreviewModal from '../../stake/StakePreviewModal.vue';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();

/** COMPOSABLES */
const {
  userData: {
    stakedPools,
    isLoadingUserStakingData,
    isLoadingStakedPools,
    isLoadingUserPools,
    poolBoosts
  },
  setPoolAddress
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
  const _hiddenColumns = ['poolVolume', 'poolValue', 'migrate', 'stake'];
  if (isL2.value) _hiddenColumns.push('myBoost');
  return _hiddenColumns;
});

/** METHODS */
function handleStake(pool: Pool) {
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
        :noPoolsLabel="noPoolsLabel"
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
