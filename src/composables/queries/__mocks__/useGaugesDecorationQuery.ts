export default function useGaugesDecorationQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  };
}
