export default function useGaugesDecorationQuery() {
  return {
    data: [],
    isLoading: false,
    refetch: {
      value: jest.fn(),
    },
  };
}
