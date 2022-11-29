export function useStore() {
  const store = {
    commit: vi.fn(),
  };
  return store;
}

export function createStore() {
  return { state: { app: { transactionDeadline: 20 } } };
}
