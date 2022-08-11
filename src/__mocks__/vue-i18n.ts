export function createI18n() {
  return {};
}

export function useI18n() {
  return { t: jest.fn().mockImplementation() };
}
