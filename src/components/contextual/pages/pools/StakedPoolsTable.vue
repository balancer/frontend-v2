<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

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
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import { UserGuageSharesResponse } from './types';
import useWeb3 from '@/services/web3/useWeb3';

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** COMPOSABLES */
const {
  userGaugeShares,
  stakedPools,
  isLoading: isLoadingStakingData,
  setPoolAddress
} = useStaking();
const { account } = useWeb3();

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

// a fast query to let us determine if we should show
// the staked pools table and while loading, the height
// of the skeleton
const {
  data: gaugeShares,
  isIdle: isGaugeSharesIdle,
  isLoading: isLoadingGaugeShares
} = useGraphQuery<UserGuageSharesResponse>(
  subgraphs.gauge,
  ['staking', 'data', { account }],
  () => ({
    gaugeShares: {
      __args: {
        where: { user: account.value.toLowerCase() }
      },
      balance: 1,
      gauge: {
        poolId: 1
      }
    }
  }),
  reactive({
    refetchOnWindowFocus: false
  })
);

const numStakedPools = computed(
  () =>
    (gaugeShares.value?.gaugeShares || []).filter(share =>
      bnum(share.balance).gt(0)
    ).length
);

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
      stakedPct: '1',
      stakedShares: calculateFiatValueOfShares(
        pool,
        stakedBalanceMap.value[pool.id]
      )
    }));
});

/** METHODS */
function handleStake(pool: FullPool) {
  setPoolAddress(pool.address);
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  showStakeModal.value = false;
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
</script>

<template>
  <AnimatePresence :isVisible="!isLoadingStakingData && numStakedPools > 0">
    <BalStack vertical spacing="sm">
      <h5>{{ $t('staking.stakedPools') }}</h5>
      <PoolsTable
        :key="maxStakedPools"
        :isLoading="isLoadingStakingData"
        :data="maxStakedPools"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate', 'stake']"
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
  </AnimatePresence>
  <AnimatePresence
    :isVisible="
      (isLoadingStakingData && numStakedPools > 0) ||
        isLoadingGaugeShares ||
        isGaugeSharesIdle
    "
  >
    <div>
      <BalLoadingBlock class="staked-pools-table-loading" />
    </div>
  </AnimatePresence>
</template>

<style scoped>
.staked-pools-table-loading {
  height: calc(4rem + (4.375rem * v-bind(numStakedPools)));
}
</style>
