<script setup lang="ts">
import { computed, ref } from 'vue';

import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useStaking from '@/composables/staking/useStaking';

import { FullPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreviewModal from '../../stake/StakePreviewModal.vue';

import { uniqBy } from 'lodash';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  userGaugeShares,
  userLiquidityGauges,
  stakedPools,
  isLoading: isLoadingStakingData
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
const { data: userPools } = useUserPoolsQuery();

// The pools which the user has completely staked
const maxStakedPools = computed(() => {
  const userPoolIds = userPools.value?.pools.map(pool => pool.id);
  return (stakedPools.value || [])
    .filter(pool => {
      return !userPoolIds?.includes(pool.id);
    })
    .map(pool => ({
      // then indicate that those pools are maximal staked with a variable
      ...pool,
      stakedPct: '1'
    }));
});

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
        stakedPct: stakedPct.toString()
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
      stakedPct: '0'
    }));
});

// if the staked pool (from gauge subgraph) is not in the
// user pools response, stitch it together. This is because
// when all the BPT for a pool is staked, then it will not
// show up in the user pools query
const allStakedPools = computed(() => {
  // now mash them together
  const allPools = [
    ...unstakedPools.value,
    ...partiallyStakedPools.value,
    ...maxStakedPools.value
  ];
  return uniqBy(allPools, pool => pool.id);
});

/** METHODS */
function handleStake(pool: FullPool) {
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  showStakeModal.value = false;
}
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5>{{ $t('myStakedPools') }}</h5>
      <PoolsTable
        :key="allStakedPools"
        :isLoading="isLoadingStakingData"
        :data="allStakedPools"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
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
  </div>
</template>
