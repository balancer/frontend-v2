import { computed, ComputedRef } from 'vue';
import { DecoratedPoolWithFarm } from '@/beethovenx/services/subgraph/subgraph-types';
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
