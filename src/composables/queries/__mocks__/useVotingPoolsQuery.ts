export const defaultVotingPools = [];

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
