export function createI18n() {
  return {};
}

export function useI18n() {
  return { t: vi.fn().mockImplementation() };
}

export function mockI18n() {
  vi.mock('vue-i18n', () => {
    return {
      useI18n: () => ({ t: tKey => tKey }),
      createI18n: vi.fn(),
    };
  });
}
