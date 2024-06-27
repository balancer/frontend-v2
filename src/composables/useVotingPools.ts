import { orderByWeight } from '@/composables/usePoolHelpers';
import { Duration, Interval, intervalToDuration, nextThursday } from 'date-fns';

import { POOLS } from '@/constants/pools';
import { PoolToken } from '@/services/pool/types';
import useVotingPoolsQuery, {
  VotingPool,
} from '@/composables/queries/useVotingPoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';

export function orderedGaugeTokens(votingPool: VotingPool): PoolToken[] {
  return orderByWeight(votingPool.tokens as unknown as PoolToken[]);
}

export function orderedTokenURIs(votingPool: VotingPool): string[] {
  return orderByWeight(votingPool.tokens).map(token => token.logoURI);
}

export function isVe8020Pool(pool: VotingPool): boolean {
  return [
    POOLS.IdsMap.veBAL,
    POOLS.IdsMap.veLIT,
    POOLS.IdsMap.veUSH,
    POOLS.IdsMap.veQi,
    POOLS.IdsMap.veGEM,
    POOLS.IdsMap.veTHX,
  ].includes(pool.id.toLowerCase());
}

export default function useVotingPools() {
  const totalVotes = 1e4;

  // Fetch onchain votes data for given votingGauges
  const votingPoolsQuery = useVotingPoolsQuery();

  const isLoading = computed(() => isQueryLoading(votingPoolsQuery));

  const votingPools = computed(() => votingPoolsQuery.data.value || []);

  const votingGauges = computed(() =>
    votingPools.value.map(pool => pool.gauge)
  );

  const votingGaugeAddresses = computed(
    () => votingPools.value.map(pool => pool.gauge.address) || []
  );

  const unallocatedVotes = computed(() => {
    if (isLoading.value || !votingPools.value) return totalVotes;
    const votesRemaining = votingPools.value.reduce((remainingVotes, gauge) => {
      return remainingVotes - parseFloat(gauge.userVotes);
    }, totalVotes);
    return votesRemaining;
  });

  const now = ref(Date.now());
  const nowInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);

  onUnmounted(() => {
    if (!nowInterval) return;
    clearInterval(nowInterval);
  });

  const votingPeriodEnd = computed<number[]>(() => {
    const periodEnd = getVotePeriodEndTime();
    const interval: Interval = { start: now.value, end: periodEnd };
    const timeUntilEnd: Duration = intervalToDuration(interval);
    const formattedTime = [
      (timeUntilEnd.days || 0) % 7,
      timeUntilEnd.hours || 0,
      timeUntilEnd.minutes || 0,
      timeUntilEnd.seconds || 0,
    ];
    return formattedTime;
  });

  const votingPeriodLastHour = computed((): boolean => {
    const periodEnd = getVotePeriodEndTime();
    const interval: Interval = { start: now.value, end: periodEnd };
    const timeUntilEnd: Duration = intervalToDuration(interval);
    return (timeUntilEnd.days || 0) < 1 && (timeUntilEnd.hours || 0) < 1;
  });

  function getVotePeriodEndTime(): number {
    const n = nextThursday(new Date());
    const epochEndTime = Date.UTC(
      n.getFullYear(),
      n.getMonth(),
      n.getDate(),
      0,
      0,
      0
    );
    return epochEndTime;
  }

  return {
    totalVotes,
    isLoadingVotingPools: isLoading,
    isRefetchingVotingPools: votingPoolsQuery.isRefetching,
    votingPools,
    votingGauges,
    votingGaugeAddresses,
    unallocatedVotes,
    votingPeriodEnd,
    votingPeriodLastHour,
    votingPoolsQuery,
    refetchVotingPools: votingPoolsQuery.refetch,
    resetVotingPools: votingPoolsQuery.remove,
  };
}
