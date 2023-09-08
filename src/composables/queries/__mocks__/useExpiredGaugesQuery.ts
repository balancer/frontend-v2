export let defaultExpiredGauges = [];

export function mockExpiredGauges(expiredGauges) {
  defaultExpiredGauges = expiredGauges;
}

export default function useExpiredGaugesQuery() {
  return {
    data: ref(defaultExpiredGauges),
    isLoading: false,
    error: false,
  };
}

export function callGaugesIsKilledStatus() {
  return {};
}
