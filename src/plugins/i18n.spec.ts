import i18n from './i18n';

describe('i18n should', () => {
  it('have en-US as default locale', () => {
    expect(i18n.global.locale.value).toBe('en-US');
  });

  it('work when using global.t programmatically', () => {
    expect(i18n.global.t('apiErrorCodeDetails.UnhandledGetError')).toBe(
      'Order fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
    );
  });
});
