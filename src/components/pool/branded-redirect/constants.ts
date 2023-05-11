interface BrandedRedirectData {
  id: string;
  title: string;
  description: string;
  btnText: string;
  link: string;
  buildBannerPath?: () => string;
}

export const BRANDED_REDIRECT_DATA: Record<string, BrandedRedirectData> = {
  xave: {
    id: 'xave',
    title: 'brandedRedirect.xave.title',
    description: 'brandedRedirect.xave.description',
    btnText: 'brandedRedirect.xave.btnText',
    link: 'https://app.xave.co/',
    buildBannerPath: buildXaveBannerPath,
  },
  gyro: {
    id: 'gyro',
    title: 'brandedRedirect.gyro.title',
    description: 'brandedRedirect.gyro.description',
    btnText: 'brandedRedirect.gyro.btnText',
    link: 'https://app.gyro.finance/',
  },
};

export function buildXaveBannerPath(): string {
  return new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this string into a variable or it will stop working in production builds
    '/src/assets/images/branded-redirect-logos/xave.png',
    import.meta.url
  ).href;
}
