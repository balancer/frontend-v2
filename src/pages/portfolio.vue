<script setup lang="ts">
import { computed } from 'vue';

import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import VeBalPoolTable from '@/components/contextual/pages/pools/VeBalPoolTable.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';
import { isMigratablePool } from '@/composables/usePool';
import StakingProvider from '@/providers/local/staking/staking.provider';

// COMPOSABLES

const { selectedTokens } = usePoolFilters();

const { userPools, isLoadingUserPools } = usePools();

const migratableUserPools = computed(() => {
  return userPools.value.filter(pool => isMigratablePool(pool));
});

const hiddenColumns = computed(() => [
  'poolVolume',
  'poolValue',
  'stake',
  'lockedEndDate'
]);
</script>

<template>
  <StakingProvider>
    <PortfolioPageHero />
    <div class="lg:container lg:mx-auto pt-10 md:pt-12">
      <BalStack vertical>
        <div class="px-4 lg:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myInvestments') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="xl">
          <VeBalPoolTable />
          <UnstakedPoolsTable />
          <StakedPoolsTable />

          <BalStack vertical spacing="sm" v-if="migratableUserPools.length > 0">
            <h5 class="px-4 lg:px-0">{{ $t('poolsToMigrate') }}</h5>
            <PoolsTable
              :key="migratableUserPools"
              :isLoading="isLoadingUserPools"
              :data="migratableUserPools"
              :noPoolsLabel="$t('noInvestments')"
              showPoolShares
              :selectedTokens="selectedTokens"
              :hiddenColumns="hiddenColumns"
            >
            </PoolsTable>
          </BalStack>
        </BalStack>
      </BalStack>
    </div>
  </StakingProvider>
</template>
