import { Duration, Interval, intervalToDuration, nextThursday } from 'date-fns';
import { computed, onUnmounted, ref } from 'vue';

import {
  GOERLI_VOTING_GAUGES,
  KOVAN_VOTING_GAUGES,
  MAINNET_VOTING_GAUGES,
  VotingGauge,
} from '@/constants/voting-gauges';

import useGaugeVotesQuery from './queries/useGaugeVotesQuery';
import { isGoerli, isKovan } from './useNetwork';

export default function useVotingGauges() {
  // Hard coded list of voting gauges
  const _votingGauges = computed((): VotingGauge[] => {
    if (isKovan.value) {
      return KOVAN_VOTING_GAUGES as VotingGauge[];
    } else if (isGoerli.value) {
      return GOERLI_VOTING_GAUGES as VotingGauge[];
    } else {
      return MAINNET_VOTING_GAUGES as VotingGauge[];
    }
  });

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
    isLoading,
    votingGauges,
    unallocatedVotes,
    votingPeriodEnd,
    votingPeriodLastHour,
    refetch: gaugeVotesQuery.refetch,
  };
}
