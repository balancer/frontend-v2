import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import useDebouncedRef from '@/composables/useDebouncedRed';
import { isGaugeExpired } from '../../voting-utils';
import { Network } from '@/lib/config/types';
import configs from '@/lib/config';

export function useLMVotingFilters(
  votingPools: ComputedRef<VotingPool[]>,
  expiredGauges: Ref<readonly string[] | undefined>
) {
  const router = useRouter();

  const showExpiredGauges = useDebouncedRef<boolean>(false, 500);
  const tokenFilter = useDebouncedRef<string>('', 500);
  const activeNetworkFilters = useDebouncedRef<Network[]>(
    getDefaultActiveNetworkFilter(),
    500
  );

  const poolsFilteredByExpiring = computed(() => {
    if (showExpiredGauges.value) {
      return votingPools.value;
    }

    return votingPools.value.filter(pool => {
      if (Number(pool.userVotes) > 0) {
        return true;
      }
      return !isGaugeExpired(expiredGauges.value, pool.gauge.address);
    });
  });

  function getDefaultActiveNetworkFilter() {
    const param = router.currentRoute.value.query.chain;

    if (!param || typeof param !== 'string') {
      return [];
    }

    const networkToFilter = Network[param.toUpperCase()];
    if (!networkToFilter) {
      return [];
    }

    return [networkToFilter];
  }

  const filteredVotingPools = computed(() => {
    // put filter by expiring in separate computed to maintain readability
    return poolsFilteredByExpiring.value.filter(pool => {
      let showByNetwork = true;
      if (
        activeNetworkFilters.value.length > 0 &&
        !activeNetworkFilters.value.includes(pool.network)
      ) {
        showByNetwork = false;
      }

      return (
        showByNetwork &&
        pool.tokens.some(token => {
          return token.symbol
            ?.toLowerCase()
            .includes(tokenFilter.value.toLowerCase());
        })
      );
    });
  });

  const networkFilters: Network[] = Object.entries(configs)
    .filter(details => {
      const config = details[1];
      return (
        !config.testNetwork && config.pools.Stakable.VotingGaugePools.length > 0
      );
    })
    .map(details => Number(details[0]) as Network);
  return {
    showExpiredGauges,
    activeNetworkFilters,
    filteredVotingPools,
    tokenFilter,
    networkFilters,
  };
}
