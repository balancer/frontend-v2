export function useStore() {
  const store = {
    commit: jest.fn().mockImplementation(),
  };
  return store;
}
