/* eslint-disable @typescript-eslint/no-unused-vars */
import { networkId } from '@/composables/useNetwork';
import { addressFor } from '@/composables/usePoolHelpers';
import { PoolType } from '@balancer-labs/sdk';

interface BrandedRedirectData {
  id: string;
  title: string;
  description: string;
  btnText: string;
  link: (poolId: string, poolType: PoolType | undefined) => string;
  buildBannerPath?: () => string;
}

export const BRANDED_REDIRECT_DATA: Record<string, BrandedRedirectData> = {
  xave: {
    id: 'xave',
    title: 'brandedRedirect.xave.title',
    description: 'brandedRedirect.xave.description',
    btnText: 'brandedRedirect.xave.btnText',
    link: (poolId: string, poolType: PoolType | undefined) =>
      'https://app.xave.co/',
    buildBannerPath: buildXaveBannerPath,
  },
  gyro: {
    id: 'gyro',
    title: 'brandedRedirect.gyro.title',
    description: 'brandedRedirect.gyro.description',
    btnText: 'brandedRedirect.gyro.btnText',
    link: (poolId: string, poolType: PoolType | undefined) => {
      const poolAddress = addressFor(poolId);
      const networkSlug = gyroNetworkSlugMap[networkId.value];
      console.log('poolType', poolType);
      const poolTypeSlug = gyroPoolTypeMap[poolType || ''];

      if (!networkSlug || !poolTypeSlug) return 'https://app.gyro.finance';
      return `https://app.gyro.finance/pools/${networkSlug}/${poolTypeSlug}/${poolAddress}`;
    },
  },
};

const gyroPoolTypeMap: Record<string, string> = {
  [PoolType.Gyro2]: '2-clp',
  [PoolType.Gyro3]: '3-clp',
  [PoolType.GyroE]: 'e-clp',
};

const gyroNetworkSlugMap: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  137: 'polygon',
  8453: 'base',
  1101: 'polygonZKEVM',
  42161: 'arbitrum',
};

export function buildXaveBannerPath(): string {
  return new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this string into a variable or it will stop working in production builds
    '/src/assets/images/branded-redirect-logos/xave.png',
    import.meta.url
  ).href;
}
