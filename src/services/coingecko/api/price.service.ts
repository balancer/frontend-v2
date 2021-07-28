import { CoingeckoClient } from '../coingecko.client';
import {
  CoingeckoService,
  getNativeAssetId,
  getPlatformId
} from '../coingecko.service';
import { TOKENS } from '@/constants/tokens';
import { configService as _configService } from '@/services/config/config.service';
import { invert } from 'lodash';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';
import { retryPromiseWithDelay } from '@/lib/utils/promise';

// TYPES
export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };

export class PriceService {
  client: CoingeckoClient;
  fiatParam: string;
  baseEndpoint: string;
  appNetwork: string;
  platformId: string;
  nativeAssetId: string;
  nativeAssetAddress: string;

  constructor(
    service: CoingeckoService,
    private readonly configService = _configService
  ) {
    this.client = service.client;
    this.fiatParam = service.supportedFiat;
    this.baseEndpoint = '/simple';
    this.appNetwork = this.configService.network.key;
    this.platformId = getPlatformId(this.appNetwork);
    this.nativeAssetId = getNativeAssetId(this.appNetwork);
    this.nativeAssetAddress = this.configService.network.nativeAsset.address;
  }

  async getNativeAssetPrice(): Promise<Price> {
    try {
      const response = await this.client.get<PriceResponse>(
        `${this.baseEndpoint}/price?ids=${this.nativeAssetId}&vs_currencies=${this.fiatParam}`
      );
      return response[this.nativeAssetId];
    } catch (error) {
      console.error('Unable to fetch Ether price', error);
      throw error;
    }
  }

  /**
   *  Rate limit for the CoinGecko API is 10 calls each second per IP address.
   */
  async getTokens(
    addresses: string[],
    addressesPerRequest = 100
  ): Promise<TokenPrices> {
    try {
      if (addresses.length / addressesPerRequest > 10)
        throw new Error('To many requests for rate limit.');
      addresses = addresses.map(address => this.addressMapIn(address));
      const max = 100;
      const pageCount = Math.ceil(addresses.length / max);
      const pages = Array.from(Array(pageCount).keys());
      const requests: Promise<PriceResponse>[] = [];

      pages.forEach(page => {
        const addressString = addresses.slice(max * page, max * (page + 1));
        const endpoint = `${this.baseEndpoint}/token_price/${this.platformId}?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
        const request = retryPromiseWithDelay(
          this.client.get<PriceResponse>(endpoint),
          3,
          2000
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parsePaginatedTokens(paginatedResults);

      // Inject native asset price if included in requested addresses
      if (addresses.includes(this.nativeAssetAddress)) {
        results[this.nativeAssetAddress] = await this.getNativeAssetPrice();
      }

      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      throw error;
    }
  }

  private parsePaginatedTokens(paginatedResults: TokenPrices[]): TokenPrices {
    const results = paginatedResults.reduce(
      (result, page) => ({ ...result, ...page }),
      {}
    );
    const entries = Object.entries(results);
    const parsedEntries = entries.map(result => [
      this.addressMapOut(result[0]),
      result[1]
    ]);
    return Object.fromEntries(parsedEntries);
  }

  /**
   * Map address to mainnet address if app network is a testnet
   */
  @returnChecksum()
  private addressMapIn(address: string): string {
    const addressMap = TOKENS.Prices.ChainMap[this.appNetwork];
    if (!addressMap) return address;
    return addressMap[address.toLowerCase()] || address;
  }

  /**
   * Map mainnet address back to testnet address
   */
  @returnChecksum()
  private addressMapOut(address: string): string {
    const addressMap = TOKENS.Prices.ChainMap[this.appNetwork];
    if (!addressMap) return address;
    return invert(addressMap)[address.toLowerCase()] || address;
  }
}
