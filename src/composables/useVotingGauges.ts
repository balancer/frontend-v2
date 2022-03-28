import { computed } from 'vue';
import {
  KOVAN_VOTING_GAUGES,
  MAINNET_VOTING_GAUGES,
  VotingGauge
} from '@/constants/voting-gauges';
import { isKovan } from './useNetwork';
import useGaugeVotesQuery from './queries/useGaugeVotesQuery';

export default function useVotingGauges() {
  // Hard coded list of voting gauges
  const _votingGauges = computed((): VotingGauge[] =>
    isKovan.value ? KOVAN_VOTING_GAUGES : MAINNET_VOTING_GAUGES
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

  return {
    isLoading,
    votingGauges,
    unallocatedVotes,
    refetch: gaugeVotesQuery.refetch
  };
}
