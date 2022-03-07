<script setup lang="ts">
import { computed, ref } from 'vue';

import QUERY_KEYS from '@/constants/queryKeys';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useSubgraphQuery from '@/composables/subgraph/useSubgraphQuery';
import useWeb3 from '@/services/web3/useWeb3';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';

import { FullPool } from '@/services/balancer/subgraph/types';
import { getAddress } from 'ethers/lib/utils';
import { bnum } from '@/lib/utils';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import StakePreviewModal from '../../stake/StakePreviewModal.vue';

/** TYPES */
type Props = {
  userPools: FullPool[];
};

type UserGuageShare = {
  id: string;
  gauge: {
    poolId: string;
  };
  balance: string;
};

type UserGuageSharesResponse = {
  gaugeShares: UserGuageShare[];
};

const props = withDefaults(defineProps<Props>(), {
  userPools: () => []
});

/** STATE */
const showStakeModal = ref(false);
const stakePool = ref<FullPool | undefined>();

/** QUERY ARGS */
const userPoolsAddresses = computed(() => {
  return props.userPools.map(pool => pool.address.toLowerCase());
});

const userStakedPools = computed(() => {
  if (isLoadingGaugeShares.value || !gaugeSharesRes.value) return [];
  return gaugeSharesRes.value.gaugeShares.map(share => {
    return share.gauge.poolId;
  });
});

/** COMPOSABLES */
const { account } = useWeb3();
const {
  data: gaugeSharesRes,
  isLoading: isLoadingGaugeShares
} = useSubgraphQuery<UserGuageSharesResponse>({
  subgraph: 'gauge',
  key: QUERY_KEYS.Gauges.GaugeShares.User(account),
  query: () => ({
    gaugeShares: {
      __args: {
        where: { user: account.value.toLowerCase() }
      },
      balance: 1,
      gauge: {
        poolId: 1
      }
    },
    liquidityGauges: {
      __args: {
        where: {
          poolId_in: userPoolsAddresses.value
        }
      }
    }
  })
});

const { data, isLoading: isLoadingPools } = usePoolsQuery(
  ref([]),
  {},
  {
    poolAddresses: userStakedPools
  }
);
/** COMPUTED */
const stakedPools = computed(() => data.value?.pages[0].pools);

// a map of poolId-stakedBPT for the connected user
const stakedBalanceMap = computed(() => {
  const map: Record<string, string> = {};
  if (!gaugeSharesRes.value) return map;
  for (const gaugeShare of gaugeSharesRes.value?.gaugeShares) {
    map[getAddress(gaugeShare.gauge.poolId)] = gaugeShare.balance;
  }
  return map;
});

// first retrieve all the pools the user has liquidity for
const { data: userPools } = useUserPoolsQuery();

// if the staked pool (from gauge subgraph) is not in the
// user pools response, stitch it together. This is because
// when all the BPT for a pool is staked, then it will not
// show up in the user pools query
const allStakedPools = computed(() => {
  const userPoolIds = userPools.value?.pools.map(pool => pool.id);
  const stakedPoolIds = stakedPools.value?.map(pool => pool.id);

  // first find the staked pools which are not in the user pools
  const maxStakedPools = (stakedPools.value || [])
    .filter(pool => {
      return !userPoolIds?.includes(pool.id);
    })
    .map(pool => ({
      // then indicate that those pools are maximal staked with a variable
      ...pool,
      stakedPct: '100'
    }));

  // now get the pools which are both staked, but also have BPT available for staking
  // NOTE: we are iterating through user pools here so we can access the bpt var
  const partiallyStakedPools = (userPools.value?.pools || [])
    .filter(pool => {
      return stakedPoolIds?.includes(pool.id);
    })
    .map(pool => {
      // calculate the staked percentage by using the staked balance
      // pulled from the gauge subgraph
      const stakedBalance = stakedBalanceMap.value[getAddress(pool.address)];
      const unstakedBalance = pool.bpt;
      const stakedPct = bnum(stakedBalance).div(
        bnum(stakedBalance).plus(unstakedBalance)
      );
      return {
        ...pool,
        stakedPct: stakedPct.toString()
      };
    });

  // now mash them together
  return [...partiallyStakedPools, ...maxStakedPools];
});

/** METHODS */
function handleStake(pool: FullPool) {
  showStakeModal.value = true;
  stakePool.value = pool;
}
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5>{{ $t('myStakedPools') }}</h5>
      <PoolsTable
        :key="allStakedPools"
        :isLoading="isLoadingGaugeShares || isLoadingPools"
        :data="allStakedPools"
        :noPoolsLabel="$t('noInvestments')"
        :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
        @triggerStake="handleStake"
        showPoolShares
        class="mb-8"
      />
    </BalStack>
    <StakePreviewModal v-if="showStakeModal" :pool="stakePool" />
  </div>
</template>
