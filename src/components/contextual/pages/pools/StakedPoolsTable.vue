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
import ProceedToSyncModal from '@/components/contextual/pages/vebal/cross-chain-boost/ProceedToSyncModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

import PortfolioSyncTip from '../vebal/cross-chain-boost/PortfolioSyncTip.vue';
import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';

import CheckpointGaugeModal from '../vebal/cross-chain-boost/CheckpointGaugeModal.vue';
import CheckpointAllGaugesModal from '../vebal/cross-chain-boost/CheckpointAllGaugesModal.vue';
import { PoolAction } from './types';
import { isVeBalSupported } from '@/composables/useVeBAL';
/**
 * STATE
 */
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();

const showRestakeModal = ref(false);
const poolToRestake = ref<Pool | undefined>();

const showProceedModal = ref(false);
const defaultPoolActions = [
  PoolAction.Unstake,
  PoolAction.Add,
  PoolAction.Vote,
];

const showPokeAllGaugesModal = ref(false);

const poolToCheckpoint = ref<Pool | undefined>();
const showCheckpointModal = ref(false);

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const {
  stakedPools,
  poolBoostsMap,
  stakedShares,
  isLoading,
  hasNonPrefGaugesPoolsAddresses,
  userGaugeShares,
} = useUserStaking();
const { shouldPokeGauge } = useCrossChainSync();

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

function handleRestake(pool: Pool) {
  showRestakeModal.value = true;
  poolToRestake.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showUnstakeModal.value = false;
  showRestakeModal.value = false;
}

function handleCheckpoint(pool: Pool) {
  showCheckpointModal.value = true;
  poolToCheckpoint.value = pool;
}

async function handleUnstakeSuccess() {
  await refetchAllUserPools();
}

// map of pool ids and pref gauges that should be poked
const shouldPokePoolsMap = ref<Record<string, string>>({});

function removePoolFromPokeMap(poolAddress: string) {
  Reflect.deleteProperty(shouldPokePoolsMap.value, poolAddress);
}

function resetShouldPokePoolsMap() {
  shouldPokePoolsMap.value = {};
}

function onSuccessCheckpoint(poolAddress: string) {
  showCheckpointModal.value = false;
  poolToCheckpoint.value = undefined;
  removePoolFromPokeMap(poolAddress);
}

watch(
  () => userGaugeShares.value,
  async val => {
    if (!val || isVeBalSupported.value) return;
    console.log('userGaugeShares', val);
    for (const gauge of val) {
      try {
        const id = gauge?.gauge.id;

        if (!id) {
          throw new Error('No gauge id');
        }

        const shouldPoke = await shouldPokeGauge(id);
        if (shouldPoke) {
          shouldPokePoolsMap.value[gauge.gauge.poolAddress] = id;
        }
      } catch (e) {
        console.log(e);
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.stakedPools') }}
      </h5>
      <PortfolioSyncTip
        :shouldPokePoolsMap="shouldPokePoolsMap"
        @show-proceed-modal="showProceedModal = true"
        @show-poke-all-gauge-modal="showPokeAllGaugesModal = true"
      />
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
        showStakeActions
        :showBoost="isPoolBoostsEnabled"
        :defaultPoolActions="defaultPoolActions"
        :shouldPokePoolsMap="shouldPokePoolsMap"
        :hasNonPrefGaugesPoolsAddresses="hasNonPrefGaugesPoolsAddresses"
        @trigger-unstake="handleUnstake"
        @trigger-restake="handleRestake"
        @trigger-vote="showProceedModal = true"
        @trigger-checkpoint="handleCheckpoint"
      />
    </BalStack>

    <!-- Unstake modal -->
    <StakePreviewModal
      v-if="poolToUnstake"
      :pool="poolToUnstake"
      :isVisible="showUnstakeModal"
      action="unstake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />

    <!-- Restake modal -->
    <StakePreviewModal
      v-if="poolToRestake"
      :pool="poolToRestake"
      :isVisible="showRestakeModal"
      action="restake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />

    <ProceedToSyncModal
      :isVisible="showProceedModal"
      @close="showProceedModal = false"
    />

    <CheckpointAllGaugesModal
      :shouldPokePoolsMap="shouldPokePoolsMap"
      :isVisible="showPokeAllGaugesModal"
      @close="showPokeAllGaugesModal = false"
      @success="resetShouldPokePoolsMap"
    />

    <CheckpointGaugeModal
      v-if="poolToCheckpoint"
      :poolAddress="poolToCheckpoint.address"
      :isVisible="showCheckpointModal"
      @close="showCheckpointModal = false"
      @success="onSuccessCheckpoint"
    />
  </div>
</template>
