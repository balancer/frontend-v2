export default function useGaugeVotesQuery() {
  return {
    data: [],
    isLoading: false,
    isIdle: false,
    error: false,
    refetch: jest.fn(),
  };
}
