<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { isPoolBoostsEnabled } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import { Pool } from '@/services/pool/types';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '../pool/staking/StakePreviewModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

/**
 * STATE
 */
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { stakedPools, poolBoostsMap, stakedShares, isLoading } =
  useUserStaking();
const { refetchAllUserPools } = useUserPools();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const networkName = configService.network.shortName;

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noStakedInvestments', [networkName])
    : t('connectYourWallet');
});

const hiddenColumns = computed(() => {
  const _hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate', 'volume'];
  if (!isPoolBoostsEnabled.value) _hiddenColumns.push('myBoost');

  return _hiddenColumns;
});

const poolsToRenderKey = computed(() => JSON.stringify(stakedPools.value));

/**
 * METHODS
 */
function handleUnstake(pool: Pool) {
  showUnstakeModal.value = true;
  poolToUnstake.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showUnstakeModal.value = false;
}

async function handleUnstakeSuccess() {
  await refetchAllUserPools();
}
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.stakedPools') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        :data="stakedPools"
        :shares="stakedShares"
        :boosts="poolBoostsMap"
        poolsType="staked"
        :noPoolsLabel="noPoolsLabel"
        :hiddenColumns="hiddenColumns"
        sortColumn="myBalance"
        :isLoading="isWalletReady && isLoading"
        showPoolShares
        showActions
        :showBoost="isPoolBoostsEnabled"
        @trigger-unstake="handleUnstake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="poolToUnstake"
      :pool="poolToUnstake"
      :isVisible="showUnstakeModal"
      action="unstake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />
  </div>
</template>
