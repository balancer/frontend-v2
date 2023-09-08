export let defaultExpiredGauges = [];

export function mockExpiredGauges(foo) {
  defaultExpiredGauges = foo;
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
