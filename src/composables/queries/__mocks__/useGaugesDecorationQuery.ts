export default function useGaugesDecorationQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: {
      value: vi.fn(),
    },
  };
}
