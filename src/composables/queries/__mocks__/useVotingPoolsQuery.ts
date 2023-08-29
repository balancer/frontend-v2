export default function useVotingPoolsQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: vi.fn(),
    isIdle: false,
    error: false,
  };
}
