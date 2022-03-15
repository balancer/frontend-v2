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
  const votingGauges = computed((): VotingGauge[] =>
    isKovan.value ? KOVAN_VOTING_GAUGES : MAINNET_VOTING_GAUGES
  );

  // Fetch onchain votes data for given votingGauges
  const gaugeVotesQuery = useGaugeVotesQuery(votingGauges.value);

  const isLoadingVotes = computed(
    (): boolean =>
      gaugeVotesQuery.isLoading.value ||
      gaugeVotesQuery.isIdle.value ||
      !!gaugeVotesQuery.error.value
  );

  // function poolsFor(network: Network) {}

  return {
    poolsWithGauges,
    isLoadingVotes,
    refetchGauges
  };
}
