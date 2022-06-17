// This is legacy module and should be removed at some point
// There's no need to mock translations, they are globally available for all tests rendered with vue-test-utils
export function useI18n() {
  return {
    t: jest.fn().mockImplementation()
  };
}

export function createI18n() {
  return {};
}
