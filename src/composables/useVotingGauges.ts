import { Duration, Interval, intervalToDuration, nextThursday } from 'date-fns';
import { computed, ref } from 'vue';

import {
  KOVAN_VOTING_GAUGES,
  MAINNET_VOTING_GAUGES,
  VotingGauge
} from '@/constants/voting-gauges';

import useGaugeVotesQuery from './queries/useGaugeVotesQuery';
import { isKovan } from './useNetwork';

export default function useVotingGauges() {
  // Hard coded list of voting gauges
  const _votingGauges = computed((): VotingGauge[] =>
    isKovan.value
      ? (KOVAN_VOTING_GAUGES as VotingGauge[])
      : (MAINNET_VOTING_GAUGES as VotingGauge[])
  );

  // Fetch onchain votes data for given votingGauges
  const gaugeVotesQuery = useGaugeVotesQuery(_votingGauges.value);

  const isLoading = computed(
    (): boolean =>
      gaugeVotesQuery.isLoading.value ||
      gaugeVotesQuery.isIdle.value ||
      !!gaugeVotesQuery.error.value
  );

  const votingGauges = computed(() => gaugeVotesQuery.data.value || []);

  const unallocatedVotes = computed(() => {
    const totalVotes = 1e4;
    if (isLoading.value || !votingGauges.value) return totalVotes;
    const votesRemaining = votingGauges.value.reduce(
      (remainingVotes, gauge) => {
        return remainingVotes - parseFloat(gauge.userVotes);
      },
      totalVotes
    );
    return votesRemaining;
  });

  const now = ref(Date.now());
  setInterval(() => {
    now.value = Date.now();
  }, 1000);

  const votingPeriodEnd = computed<number[]>(() => {
    const periodEnd = getVotePeriodEndTime();
    const interval: Interval = { start: now.value, end: periodEnd };
    const timeUntilEnd: Duration = intervalToDuration(interval);
    const formattedTime = [
      (timeUntilEnd.days || 0) % 7,
      timeUntilEnd.hours || 0,
      timeUntilEnd.minutes || 0,
      timeUntilEnd.seconds || 0
    ];
    return formattedTime;
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
    isLoading,
    votingGauges,
    unallocatedVotes,
    votingPeriodEnd,
    refetch: gaugeVotesQuery.refetch
  };
}
