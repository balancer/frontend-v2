import { SUPPORTED_FIAT } from '@/constants/currency';
import { PriceService } from './api/price.service';
import { CoingeckoClient } from './coingecko.client';

export const getNativeAssetId = (chainId: string): string => {
  const mapping = {
    '1': 'ethereum',
    '42': 'ethereum',
    '137': 'matic-network'
  };

  return mapping[chainId] || 'ethereum';
};

export const getPlatformId = (chainId: string): string => {
  const mapping = {
    '1': 'ethereum',
    '42': 'ethereum',
    '137': 'polygon-pos'
  };

  return mapping[chainId] || 'ethereum';
};

export class CoingeckoService {
  supportedFiat: string;
  prices: PriceService;

  constructor(
    public readonly client = new CoingeckoClient(),
    priceServiceClass = PriceService
  ) {
    this.supportedFiat = SUPPORTED_FIAT.join(',');
    this.prices = new priceServiceClass(this);
  }
}
