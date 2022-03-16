<script setup lang="ts">
import { computed, ref } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useWeb3 from '@/services/web3/useWeb3';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';

import { FullPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreview from '../../stake/StakePreview.vue';

import { UserGuageSharesResponse } from './types';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import { uniqBy } from 'lodash';

/** TYPES */
type Props = {
  userPools: FullPool[];
};

const props = withDefaults(defineProps<Props>(), {
  userPools: () => []
});

/** STATE */
const showStakeModal = ref(false);
const hasStaked = ref(false);
const stakePool = ref<FullPool | undefined>();

/** QUERY ARGS */
const userPoolIds = computed(() => {
  return props.userPools.map(pool => pool.id);
});

const userStakedPools = computed(() => {
  if (isLoadingStakingData.value || !stakingData.value) return [];
  return stakingData.value.gaugeShares.map(share => {
    return share.gauge.poolId;
  });
});

/** COMPOSABLES */
const { account } = useWeb3();
const { data: stakingData, isLoading: isLoadingStakingData } = useGraphQuery<
  UserGuageSharesResponse
>(subgraphs.gauge, ['staking', 'data', { account, userPoolIds }], () => ({
  gaugeShares: {
    __args: {
      where: { user: account.value.toLowerCase() }
    },
    balance: true,
    gauge: {
      poolId: true
    }
  },
  liquidityGauges: {
    __args: {
      where: {
        poolId_in: userPoolIds.value
      }
    },
    poolId: true
  }
}));

const { data: stakedPoolsRes, isLoading: isLoadingPools } = usePoolsQuery(
  ref([]),
  {},
  {
    poolIds: userStakedPools
  }
);

/** COMPUTED */
const stakedPools = computed(() => stakedPoolsRes.value?.pages[0].pools);

// a map of poolId-stakedBPT for the connected user
const stakedBalanceMap = computed(() => {
  const map: Record<string, string> = {};
  if (!stakingData.value) return map;
  for (const gaugeShare of stakingData.value?.gaugeShares) {
    map[gaugeShare.gauge.poolId] = gaugeShare.balance;
  }
  return map;
});

// first retrieve all the pools the user has liquidity for
const { data: userPools } = useUserPoolsQuery();

// The pools which the user has completely staked
const maxStakedPools = computed(() => {
  return (stakedPools.value || [])
    .filter(pool => {
      return !userPoolIds.value.includes(pool.id);
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
  const availableGaugePoolIds = (stakingData.value?.liquidityGauges || []).map(
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
  hasStaked.value = false;
}

function handleStakeSuccess() {
  hasStaked.value = true;
}
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5>{{ $t('myStakedPools') }}</h5>
      <PoolsTable
        :key="allStakedPools"
        :isLoading="isLoadingStakingData || isLoadingPools"
        :data="allStakedPools"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
        @triggerStake="handleStake"
        showPoolShares
      />
    </BalStack>
    <teleport to="#modal">
      <BalModal
        :show="showStakeModal"
        @close="handleModalClose"
        :fireworks="hasStaked"
      >
        <StakePreview
          :pool="stakePool"
          @close="handleModalClose"
          @success="handleStakeSuccess"
        />
      </BalModal>
    </teleport>
  </div>
</template>
