export default function useProtocolRewardsQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: {
      value: vi.fn(),
    },
  };
}
