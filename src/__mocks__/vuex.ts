export function useStore() {
  const store = {
    commit: vi.fn().mockImplementation(),
  };
  return store;
}

export function createStore() {
  return { state: { app: { transactionDeadline: 20 } } };
}
