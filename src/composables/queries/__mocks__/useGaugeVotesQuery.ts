export default function useGaugeVotesQuery() {
  return {
    data: [],
    isLoading: false,
    error: false,
    refetch: jest.fn(),
  };
}
