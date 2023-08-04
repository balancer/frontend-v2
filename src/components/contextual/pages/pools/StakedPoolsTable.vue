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
import PokeAllGaugesModal from '@/components/modals/PokeAllGaugesModal.vue';

/**
 * STATE
 */
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();

const showRestakeModal = ref(false);
const poolToRestake = ref<Pool | undefined>();

const showProceedModal = ref(false);
const defaultPoolActions = ['unstake', 'add', 'remove', 'vote'];

const showPokeAllGaugesModal = ref(false);
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
  poolsGauges,
  hasNonPrefGaugesPoolsIds,
} = useUserStaking();
const { getGaugeWorkingBalance } = useCrossChainSync();

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

async function handleUnstakeSuccess() {
  await refetchAllUserPools();
}

// arr of pool ids that should be poked
const shouldPokePoolsArr = ref<string[]>([]);
watch(
  () => poolsGauges.value,
  async val => {
    if (!val) return;
    for (const pool of val.pools) {
      try {
        const id = pool.preferentialGauge?.id;

        if (!id) {
          return;
        }

        const balance = await getGaugeWorkingBalance(id);
        if (balance[1]?.gt(balance[0])) {
          shouldPokePoolsArr.value.push(id);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.stakedPools') }}
      </h5>
      {{ hasNonPrefGaugesPoolsIds }}
      <PortfolioSyncTip
        :shouldPokePoolsArr="shouldPokePoolsArr"
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
        :shouldPokePoolsArr="shouldPokePoolsArr"
        :hasNonPrefGaugesPoolsIds="hasNonPrefGaugesPoolsIds"
        @trigger-unstake="handleUnstake"
        @trigger-restake="handleRestake"
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

    <PokeAllGaugesModal
      :shouldPokePoolsArr="shouldPokePoolsArr"
      :isVisible="showPokeAllGaugesModal"
      @close="showPokeAllGaugesModal = false"
    />
  </div>
</template>
