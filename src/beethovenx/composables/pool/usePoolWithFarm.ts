import { computed, ComputedRef } from 'vue';
import { flatten } from 'lodash';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useFarmsQuery from '@/beethovenx/composables/farms/useFarmsQuery';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
import {
  DecoratedPoolWithFarm,
  Farm
} from '@/beethovenx/services/subgraph/subgraph-types';
import useAllFarmsForUserQuery from '@/beethovenx/composables/farms/useAllFarmsForUserQuery';
import usePools from '@/composables/pools/usePools';
import usePoolQuery from '@/composables/queries/usePoolQuery';

export default function usePoolWithFarm(
  poolId: string
): {
  pool: ComputedRef<DecoratedPoolWithFarm | undefined>;
  loadingPool: ComputedRef<boolean>;
  isLoadingFarms: ComputedRef<boolean>;
} {
  const { poolsWithFarms, userPools, isLoadingFarms } = usePools();
  const poolQuery = usePoolQuery(poolId);

  const pool = computed(() => {
    const poolWithFarm = poolsWithFarms.value.find(
      poolWithFarm => poolWithFarm.id === poolId
    );
    const userPool = userPools.value.find(
      poolWithFarm => poolWithFarm.id === poolId
    );

    if (!poolQuery.data.value) {
      return undefined;
    }

    return {
      ...poolQuery.data.value,
      hasLiquidityMiningRewards: !!poolWithFarm,
      decoratedFarm: poolWithFarm?.decoratedFarm,
      shares: userPool?.shares
    };
  });

  const loadingPool = computed(
    () => poolQuery.isLoading.value || poolQuery.isIdle.value || !pool.value
  );

  return {
    pool,
    loadingPool,
    isLoadingFarms
  };
}
