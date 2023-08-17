<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { PoolAction } from './types';

/**
 * STATE
 */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();
const networkName = configService.network.shortName;
const hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate', 'volume'];

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const {
  unstakedPools,
  userPoolShares,
  refetchAllUserPools,
  isLoading: isLoadingPools,
} = useUserPools();
const defaultPoolActions = [
  PoolAction.Stake,
  PoolAction.Add,
  PoolAction.Remove,
];

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noUnstakedInvestments', [networkName])
    : t('connectYourWallet');
});

const poolsToRenderKey = computed(() => JSON.stringify(unstakedPools.value));

/**
 * METHODS
 */
function handleStake(pool: Pool) {
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showStakeModal.value = false;
}

async function handleStakeSuccess() {
  await refetchAllUserPools();
}

onMounted(() => {
  refetchAllUserPools();
});
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.unstakedPools') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        :isLoading="isWalletReady && isLoadingPools"
        :data="unstakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        :defaultPoolActions="defaultPoolActions"
        showPoolShares
        showActions
        @trigger-stake="handleStake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="stakePool"
      :pool="stakePool"
      :isVisible="showStakeModal"
      action="stake"
      @close="handleModalClose"
      @success="handleStakeSuccess"
    />
  </div>
</template>
