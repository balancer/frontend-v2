import { SUPPORTED_FIAT } from '@/constants/currency';

import { PriceService } from './api/price.service';
import { coingeckoClient } from './coingecko.client';
import config from '@/lib/config';

export const getNativeAssetId = (chainId: string): string => {
  const mapping = Object.fromEntries(
    Object.values(config).map(c => {
      return [c.chainId.toString(), c.thirdParty.coingecko.nativeAssetId];
    })
  );

  return mapping[chainId] || 'ethereum';
};

export const getPlatformId = (chainId: string): string => {
  const mapping = Object.fromEntries(
    Object.values(config).map(c => {
      return [c.chainId.toString(), c.thirdParty.coingecko.platformId];
    })
  );

  return mapping[chainId] || 'ethereum';
};

export class CoingeckoService {
  supportedFiat: string;
  prices: PriceService;

  constructor(
    public readonly client = coingeckoClient,
    priceServiceClass = PriceService
  ) {
    this.supportedFiat = SUPPORTED_FIAT.join(',');
    this.prices = new priceServiceClass(this);
  }
}

export const coingeckoService = new CoingeckoService();
