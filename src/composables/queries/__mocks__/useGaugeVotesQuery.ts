export default function useGaugeVotesQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: vi.fn(),
    isIdle: false,
    error: false,
  };
}
