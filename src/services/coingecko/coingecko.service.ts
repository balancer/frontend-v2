import { PriceService } from './api/price.service';
import { CoingeckoClient } from './coingecko.client';

const SUPPORTED_FIAT = ['usd'];

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
