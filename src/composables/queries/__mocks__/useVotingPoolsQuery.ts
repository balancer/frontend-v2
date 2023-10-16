import { VotingPool } from '../useVotingPoolsQuery';

export let defaultVotingPools: VotingPool[] = [];

export function mockVotingPools(votingPools: VotingPool[]) {
  defaultVotingPools = votingPools;
}

export default function useVotingPoolsQuery() {
  return {
    data: ref(defaultVotingPools),
    isLoading: ref(false),
    isInitialLoading: ref(false),
    refetch: vi.fn(),
    isIdle: false,
    error: false,
  };
}
