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
  stakedPools,
  isLoading: isLoadingStakingData,
  setPoolAddress
} = useStaking();
const { account } = useWeb3();

/** COMPUTED */

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
        where: { user: account.value.toLowerCase(), balance_gt: '0' }
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
  () => (gaugeShares.value?.gaugeShares || []).length
);

/** METHODS */
function handleStake(pool: FullPool) {
  setPoolAddress(pool.address);
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  showStakeModal.value = false;
}
</script>

<template>
  <AnimatePresence
    :isVisible="
      !isLoadingStakingData && (numStakedPools > 0 || stakedPools.length > 0)
    "
  >
    <div class="mt-8">
      <BalStack vertical spacing="sm">
        <h5>{{ $t('staking.stakedPools') }}</h5>
        <PoolsTable
          :key="stakedPools"
          :data="stakedPools"
          :noPoolsLabel="$t('noInvestments')"
          :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
          @triggerStake="handleStake"
          showPoolShares
          onlyStakedPct
        />
      </BalStack>
    </div>
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
    <div class="mt-8">
      <BalLoadingBlock class="staked-pools-table-loading" />
    </div>
  </AnimatePresence>
</template>

<style scoped>
.staked-pools-table-loading {
  height: calc(4rem + (4.375rem * v-bind(numStakedPools)));
}
</style>
