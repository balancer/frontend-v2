<script setup lang="ts">
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import VeBalPoolTable from '@/components/contextual/pages/pools/VeBalPoolTable.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import { useLock } from '@/composables/useLock';
import StakingProvider from '@/providers/local/staking/staking.provider';

// COMPOSABLES

const { lockPool, lock } = useLock();
</script>

<template>
  <StakingProvider>
    <PortfolioPageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myInvestments') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="2xl">
          <UnstakedPoolsTable />
          <StakedPoolsTable />
          <VeBalPoolTable
            v-if="lockPool && Number(lock?.lockedAmount) > 0"
            :lock="lock"
            :lockPool="lockPool"
          />
        </BalStack>
      </BalStack>
    </div>
  </StakingProvider>
</template>
