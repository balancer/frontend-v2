export const defaultExpiredGauges = [];

export default function useExpiredGaugesQuery() {
  return {
    data: ref(defaultExpiredGauges),
    isLoading: false,
    error: false,
  };
}
