<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import useNetwork, { isPoolBoostsEnabled } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import { Pool } from '@/services/pool/types';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '../pool/staking/StakePreviewModal.vue';
import ProceedToSyncModal from '@/components/contextual/pages/vebal/cross-chain-boost/ProceedToSyncModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import {
  NetworkSyncState,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';

/**
 * STATE
 */
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();
const showProceedModal = ref(false);

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { stakedPools, poolBoostsMap, stakedShares, isLoading } =
  useUserStaking();
const { networkId } = useNetwork();

const { refetchAllUserPools } = useUserPools();
const { isWalletReady, isWalletConnecting, account } = useWeb3();
const { t } = useI18n();
const networkName = configService.network.shortName;
const {
  networksSyncState,
  tempSyncingNetworks,
  l2VeBalBalances,
  isLoading: isLoadingSyncState,
} = useCrossChainSync();
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
const showVeBalSyncTip = computed(() => {
  const state = networksSyncState.value[networkId.value];
  if (!state || isLoadingSyncState.value) return false;
  return (
    state === NetworkSyncState.Unsynced &&
    !tempSyncingNetworks.value[account.value]?.networks.includes(
      networkId.value
    )
  );
});

const veBalSyncTip = computed(() => {
  if (!showVeBalSyncTip.value) return null;

  if (Number(l2VeBalBalances.value?.[networkId.value]) > 0) {
    return {
      title: 'Resync if you acquire new veBAL',
      text: 'Newly acquired veBAL doesn’t auto-sync to L2s. Remember to resync on Ethereum Mainnet after acquiring more veBAL to continue boosting to your max.',
    };
  }

  return {
    title: 'Sync your veBAL to maximize your boost',
    text: 'If you have veBAL, sync your veBAL balance from Ethereum Mainnet to max your boost while staking on Arbitrum. Resync after acquiring more veBAL to continue boosting to your max.',
  };
});
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
      <BalAlert
        v-if="showVeBalSyncTip"
        :title="veBalSyncTip?.title"
        type="tip"
        class="mb-5 w-100"
      >
        <div class="flex items-center">
          <div class="flex-[2]">{{ veBalSyncTip?.text }}</div>
          <div class="flex flex-1 justify-end">
            <BalBtn color="gradient" @click="showProceedModal = true">
              Sync veBal
            </BalBtn>
          </div>
        </div>
      </BalAlert>
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
    <ProceedToSyncModal
      :isVisible="showProceedModal"
      @close="showProceedModal = false"
    />
  </div>
</template>
