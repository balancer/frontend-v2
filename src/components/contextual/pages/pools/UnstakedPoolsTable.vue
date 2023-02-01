<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { isMigratablePool } from '@/composables/usePool';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserPools } from '@/providers/local/user-pools.provider';

/**
 * STATE
 */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();
const networkName = configService.network.shortName;
const hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate'];

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const {
  unstakedPools,
  userPoolShares,
  isLoading: isLoadingPools,
} = useUserPools();

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noUnstakedInvestments', [networkName])
    : t('connectYourWallet');
});

const poolsToRenderKey = computed(() => JSON.stringify(unstakedPools.value));

// Remove migratable pools from the unstaked pools array.
const _unstakedPools = computed((): Pool[] => {
  return unstakedPools.value.filter(pool => !isMigratablePool(pool));
});

/**
 * METHODS
 */
function handleStake(pool: Pool) {
  // setPoolAddress(pool.address);
  showStakeModal.value = true;
  stakePool.value = pool;
}

// function handleModalClose() {
//   showStakeModal.value = false;
// }
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.unstakedPools') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        :isLoading="isLoadingPools"
        :data="_unstakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        showPoolShares
        showActions
        @trigger-stake="handleStake"
      />
    </BalStack>
    <!-- <StakingProvider
      v-if="stakePool"
      :poolAddress="getAddressFromPoolId(stakePool.id)"
    >
      <StakePreviewModal
        :pool="stakePool"
        :isVisible="showStakeModal"
        action="stake"
        @close="handleModalClose"
      />
    </StakingProvider> -->
  </div>
</template>
