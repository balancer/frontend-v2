<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { isL2 } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';

/**
 * COMPOSABLES
 */
const { stakedPools, poolBoostsMap, stakedBptMap, isLoading } =
  useUserStaking();
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
  const _hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate'];
  if (isL2.value) _hiddenColumns.push('myBoost');

  return _hiddenColumns;
});

const poolsToRenderKey = computed(() => JSON.stringify(stakedPools.value));
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
        :shares="stakedBptMap"
        :boosts="poolBoostsMap"
        poolsType="staked"
        :noPoolsLabel="noPoolsLabel"
        :hiddenColumns="hiddenColumns"
        sortColumn="myBalance"
        :isLoading="isLoading"
        showPoolShares
        showActions
        :showBoost="!isL2"
      />
    </BalStack>
  </div>
</template>
