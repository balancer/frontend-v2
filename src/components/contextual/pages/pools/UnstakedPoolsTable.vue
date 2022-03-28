<script setup lang="ts">
import { computed, ref } from 'vue';

import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useStaking from '@/composables/staking/useStaking';

import {
  DecoratedPool,
  DecoratedPoolWithShares,
  FullPool
} from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreviewModal from '../../stake/StakePreviewModal.vue';

import { uniqBy } from 'lodash';
import { isMigratablePool } from '@/composables/usePool';
import { isL2 } from '@/composables/useNetwork';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  userGaugeShares,
  userLiquidityGauges,
  stakedPools,
  isLoadingStakingData,
  setPoolAddress
} = useStaking();

/** COMPUTED */
// a map of poolId-stakedBPT for the connected user
const stakedBalanceMap = computed(() => {
  const map: Record<string, string> = {};
  if (!userGaugeShares.value) return map;
  for (const gaugeShare of userGaugeShares.value) {
    map[gaugeShare.gauge.poolId] = gaugeShare.balance;
  }
  return map;
});

// first retrieve all the pools the user has liquidity for
const {
  data: userPools,
  isLoading: isLoadingUserPools,
  isIdle: isUserPoolsIdle
} = useUserPoolsQuery();

const partiallyStakedPools = computed(() => {
  const stakedPoolIds = stakedPools.value?.map(pool => pool.id);
  // The pools which are both staked, but also have BPT available for staking
  // NOTE: we are iterating through user pools here so we can access the bpt var
  return (userPools.value?.pools || [])
    .filter(pool => {
      return stakedPoolIds?.includes(pool.id);
    })
    .map(pool => {
      // calculate the staked percentage by using the staked balance
      // pulled from the gauge subgraph
      const stakedBalance = stakedBalanceMap.value[pool.id];
      const unstakedBalance = pool.bpt;
      const stakedPct = bnum(stakedBalance).div(
        bnum(stakedBalance).plus(unstakedBalance)
      );
      return {
        ...pool,
        stakedPct: stakedPct.toString(),
        stakedShares: calculateFiatValueOfShares(pool, stakedBalance)
      };
    });
});

// Pools where there is no staked BPT at all
const unstakedPools = computed(() => {
  const availableGaugePoolIds = (userLiquidityGauges.value || []).map(
    gauge => gauge.poolId
  );
  return (userPools.value?.pools || [])
    .filter(pool => {
      return availableGaugePoolIds?.includes(pool.id);
    })
    .map(pool => ({
      ...pool,
      stakedPct: '0',
      stakedShares: '0'
    }));
});

const poolsToRender = computed(() => {
  const stakablePools = [...partiallyStakedPools.value, ...unstakedPools.value];
  const stakableUserPoolIds = stakablePools.map(pool => pool.id);
  const nonMigratableUserPools = (userPools.value?.pools || [])
    .filter(pool => !isMigratablePool(pool))
    .filter(pool => !stakableUserPoolIds.includes(pool.id));
  // now mash them together
  return uniqBy([...nonMigratableUserPools, ...stakablePools], pool => pool.id);
});

const hiddenColumns = computed((): string[] => {
  const hiddenCols = ['poolVolume', 'poolValue', 'migrate'];
  if (isL2.value) hiddenCols.push('stake');
  return hiddenCols;
});

/** METHODS */
function handleStake(pool: FullPool) {
  setPoolAddress(pool.address);
  showStakeModal.value = true;
  stakePool.value = pool;
}

function calculateFiatValueOfShares(
  pool: DecoratedPoolWithShares | DecoratedPool,
  stakedBalance: string
) {
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times((stakedBalance || '0').toString())
    .toString();
}

function handleModalClose() {
  showStakeModal.value = false;
}
</script>

<template>
  <BalStack vertical spacing="sm">
    <h5 v-if="!isL2">{{ $t('staking.unstakedPools') }}</h5>
    <PoolsTable
      :key="poolsToRender"
      :isLoading="isLoadingStakingData || isLoadingUserPools || isUserPoolsIdle"
      :data="poolsToRender"
      :noPoolsLabel="$t('noInvestments')"
      :hiddenColumns="hiddenColumns"
      @triggerStake="handleStake"
      showPoolShares
    />
  </BalStack>
  <StakePreviewModal
    :pool="stakePool"
    :isVisible="showStakeModal"
    @close="handleModalClose"
    action="stake"
  />
</template>
