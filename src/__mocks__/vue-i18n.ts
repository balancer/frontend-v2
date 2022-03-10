export function useI18n() {
  return {
    t: jest.fn().mockImplementation()
  };
}

export function createI18n() {
  return {};
}
