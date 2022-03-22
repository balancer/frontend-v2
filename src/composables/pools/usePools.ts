import { computed, ComputedRef, Ref, ref } from 'vue';

import { flatten, uniqBy } from 'lodash';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useFarms from '@/beethovenx/composables/farms/useFarms';
import { decorateFarms } from '@/beethovenx/utils/farmHelper';
import useAverageBlockTime from '@/beethovenx/composables/blocks/useAverageBlockTime';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';
import {
  DecoratedPoolWithShares,
  PoolType,
  LinearPool
} from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import {
  DecoratedPoolWithFarm,
  DecoratedPoolWithRequiredFarm,
  Farm
} from '@/beethovenx/services/subgraph/subgraph-types';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';

export default function usePools(poolsTokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(poolsTokenList, {}, { pageSize: 1000 });
  const userPoolsQuery = useUserPoolsQuery();
  const protocolDataQuery = useProtocolDataQuery();
  const { appNetworkConfig } = useWeb3();
  const { beethovenxConfig } = useBeethovenxConfig();
  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );

  const {
    farms,
    allFarmsForUser,
    isLoadingFarms,
    harvestAllFarms,
    refetchFarmsForUser
  } = useFarms();
  const { blocksPerYear, blocksPerDay } = useAverageBlockTime();

  const pools = computed(() => {
    if (!poolsQuery.data.value) {
      return [];
    }

    const flattened = flatten(
      poolsQuery.data.value.pages.map(page => page.pools)
    );
    return flattened;
  });

  const bptAddresses = computed(() => pools.value.map(pool => pool.address));

  const decoratedFarms = computed(() => {
    //here we replace the old farm with the fbeets farm on fidellio duetto.
    const mappedFarms = farms.value
      .filter(farm => farm.id !== appNetworkConfig.fBeets.oldFarmId)
      .map(
        (farm): Farm =>
          farm.id === appNetworkConfig.fBeets.farmId
            ? {
                ...farm,
                pair: appNetworkConfig.fBeets.poolAddress.toLowerCase()
              }
            : farm
      );

    return decorateFarms(
      pools.value,
      mappedFarms,
      allFarmsForUser.value,
      blocksPerYear.value,
      blocksPerDay.value,
      beetsPrice.value
    );
  });

  const poolsWithFarms: ComputedRef<DecoratedPoolWithFarm[]> = computed(() => {
    return pools.value.map(pool => {
      const decoratedFarm = decoratedFarms.value.find(
        farm => pool.address.toLowerCase() === farm.pair.toLowerCase()
      );

      return {
        ...pool,
        decoratedFarm
      };
    });
  });

  const onlyPoolsWithFarms: ComputedRef<DecoratedPoolWithRequiredFarm[]> = computed(
    () => {
      return poolsWithFarms.value.filter(
        pool => !!pool.farm
      ) as DecoratedPoolWithRequiredFarm[];
    }
  );

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const userPools = computed<DecoratedPoolWithShares[]>(() => {
    const userPools = userPoolsQuery.data.value?.pools || [];
    const userFarmPools = onlyPoolsWithFarms.value
      .filter(pool => pool.decoratedFarm.stake > 0)
      .map(pool => ({ ...pool, shares: '0' }));

    return uniqBy([...userPools, ...userFarmPools], 'id').map(pool => {
      const decoratedFarm = decoratedFarms.value.find(
        farm => pool.address.toLowerCase() === farm.pair.toLowerCase()
      );

      return { ...pool, decoratedFarm };
    });
  });

  const totalInvestedAmount = computed(
    () => userPoolsQuery.data.value?.totalInvestedAmount
  );

  const isLoadingPools = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const isLoadingUserPools = computed(
    () => userPoolsQuery.isLoading.value || userPoolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  const communityPools = computed(() => {
    return poolsTokenList.value.length > 0
      ? poolsWithFarms.value?.filter(pool => {
          return (
            poolsTokenList.value.every((selectedToken: string) =>
              pool.tokenAddresses.includes(selectedToken)
            ) &&
            !beethovenxConfig.value.incentivizedPools.includes(pool.id) &&
            pool.poolType !== PoolType.Linear
          );
        })
      : poolsWithFarms?.value.filter(
          pool =>
            !beethovenxConfig.value.incentivizedPools.includes(pool.id) &&
            pool.poolType !== PoolType.Linear
        );
  });

  const beethovenPools = computed(() => {
    return poolsTokenList.value.length > 0
      ? poolsWithFarms.value?.filter(pool => {
          return (
            poolsTokenList.value.every(
              (selectedToken: string) =>
                pool.tokenAddresses.includes(selectedToken) ||
                pool.mainTokens?.includes(selectedToken)
            ) && beethovenxConfig.value.incentivizedPools.includes(pool.id)
          );
        })
      : poolsWithFarms?.value.filter(pool =>
          beethovenxConfig.value.incentivizedPools.includes(pool.id)
        );
  });

  const linearPools = computed(() => {
    return pools.value.filter(pool => {
      if (pool.poolType === PoolType.Linear) {
        return pool as LinearPool;
      }
    });
  });

  // METHODS
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  function refetchPools() {
    poolsQuery.refetch.value();
  }

  return {
    // computed
    pools,
    bptAddresses,
    communityPools,
    beethovenPools,
    linearPools,
    tokens,
    userPools,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingUserPools,
    poolsHasNextPage: false,
    poolsIsFetchingNextPage,
    isLoadingFarms,
    poolsWithFarms,
    onlyPoolsWithFarms,
    poolsQuery,

    // methods
    loadMorePools,
    refetchPools,

    harvestAllFarms,
    refetchFarmsForUser,
    farms,
    allFarmsForUser
  };
}
