export default function useGaugesQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: jest.fn(),
  };
}
