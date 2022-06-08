<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import { isMigratablePool } from '@/composables/usePool';
import StakingProvider from '@/providers/local/staking/staking.provider';
import useWeb3 from '@/services/web3/useWeb3';

// COMPOSABLES

const { t } = useI18n();
const { isWalletReady, isWalletConnecting } = useWeb3();

const { selectedTokens } = usePoolFilters();

const { userPools, isLoadingUserPools, poolsQuery } = usePools(selectedTokens);

const { addAlert, removeAlert } = useAlerts();

// userPools.value[0].shares
watch(poolsQuery.error, () => {
  if (poolsQuery.error.value) {
    addAlert({
      id: 'pools-fetch-error',
      label: t('alerts.pools-fetch-error'),
      type: AlertType.ERROR,
      persistent: true,
      action: poolsQuery.refetch.value,
      actionLabel: t('alerts.retry-label'),
      priority: AlertPriority.MEDIUM
    });
  } else {
    removeAlert('pools-fetch-error');
  }
});

const migratableUserPools = computed(() => {
  return userPools.value.filter(pool => isMigratablePool(pool));
});
</script>

<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <template v-if="isWalletReady || isWalletConnecting">
      <BalStack vertical>
        <div class="px-4 lg:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myInvestments') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="xl">
          <StakingProvider>
            <UnstakedPoolsTable :userPools="userPools" />
            <StakedPoolsTable :userPools="userPools" />
          </StakingProvider>
          <BalStack vertical spacing="sm" v-if="migratableUserPools.length > 0">
            <h5 class="px-4 lg:px-0">{{ $t('poolsToMigrate') }}</h5>
            <PoolsTable
              :key="migratableUserPools"
              :isLoading="isLoadingUserPools"
              :data="migratableUserPools"
              :noPoolsLabel="$t('noInvestments')"
              showPoolShares
              :selectedTokens="selectedTokens"
              :hiddenColumns="['poolVolume', 'poolValue', 'stake']"
            />
          </BalStack>
        </BalStack>
      </BalStack>
    </template>
  </div>
</template>
