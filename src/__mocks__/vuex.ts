export function useStore() {
  const store = {
    commit: jest.fn().mockImplementation(),
  };
  return store;
}

export function createStore() {
  return { state: { app: { transactionDeadline: 20 } } };
}
