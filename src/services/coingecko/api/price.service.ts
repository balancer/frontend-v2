import { fromUnixTime, getUnixTime, startOfHour } from 'date-fns';
import { groupBy, invert, last } from 'lodash';

import { twentyFourHoursInSecs } from '@/composables/useTime';
import { TOKENS } from '@/constants/tokens';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';
import { getAddressFromPoolId, includesAddress } from '@/lib/utils';
import { retryPromiseWithDelay } from '@/lib/utils/promise';
import { configService as _configService } from '@/services/config/config.service';

import { CoingeckoClient } from '../coingecko.client';
import {
  CoingeckoService,
  getNativeAssetId,
  getPlatformId,
} from '../coingecko.service';

/**
 * TYPES
 */
export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };
export interface HistoricalPriceResponse {
  market_caps: number[][];
  prices: number[][];
  total_volumes: number[][];
}
export type HistoricalPrices = { [timestamp: string]: number[] };

export class PriceService {
  client: CoingeckoClient;
  fiatParam: string;
  appNetwork: string;
  platformId: string;
  nativeAssetId: string;
  nativeAssetAddress: string;
  appAddresses: { [key: string]: string };

  constructor(
    service: CoingeckoService,
    private readonly configService = _configService
  ) {
    this.client = service.client;
    this.fiatParam = service.supportedFiat;
    this.appNetwork = this.configService.network.key;
    this.platformId = getPlatformId(this.appNetwork);
    this.nativeAssetId = getNativeAssetId(this.appNetwork);
    this.nativeAssetAddress = this.configService.network.nativeAsset.address;
    this.appAddresses = this.configService.network.addresses;
  }

  async getNativeAssetPrice(): Promise<Price> {
    try {
      const response = await this.client.get<PriceResponse>(
        `/simple/price?ids=${this.nativeAssetId}&vs_currencies=${this.fiatParam}`
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

      addresses = addresses
        .map(getAddressFromPoolId)
        .map(address => this.addressMapIn(address));
      const pageCount = Math.ceil(addresses.length / addressesPerRequest);
      const pages = Array.from(Array(pageCount).keys());
      const requests: Promise<PriceResponse>[] = [];

      pages.forEach(page => {
        const addressString = addresses.slice(
          addressesPerRequest * page,
          addressesPerRequest * (page + 1)
        );
        const endpoint = `/simple/token_price/${this.platformId}?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
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
      if (includesAddress(addresses, this.nativeAssetAddress)) {
        results[this.nativeAssetAddress] = await this.getNativeAssetPrice();
      }

      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      throw error;
    }
  }

  async getTokensHistorical(
    addresses: string[],
    days: number,
    addressesPerRequest = 1,
    aggregateBy: 'hour' | 'day' = 'day'
  ): Promise<HistoricalPrices> {
    try {
      if (addresses.length / addressesPerRequest > 10)
        throw new Error('To many requests for rate limit.');

      const now = Math.floor(Date.now() / 1000);
      const end =
        aggregateBy === 'hour' ? now : now - (now % twentyFourHoursInSecs);
      const start = end - days * twentyFourHoursInSecs;

      addresses = addresses
        .map(getAddressFromPoolId)
        .map(address => this.addressMapIn(address));
      const requests: Promise<HistoricalPriceResponse>[] = [];

      addresses.forEach(address => {
        const endpoint = `/coins/${
          this.platformId
        }/contract/${address.toLowerCase()}/market_chart/range?vs_currency=${
          this.fiatParam
        }&from=${start}&to=${end}`;
        const request = retryPromiseWithDelay(
          this.client.get<HistoricalPriceResponse>(endpoint),
          2, // retryCount
          2000 // delayTime
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parseHistoricalPrices(
        paginatedResults,
        addresses,
        start,
        aggregateBy
      );
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
    const parsedEntries = entries
      .filter(result => Object.keys(result[1]).length > 0)
      .map(result => [this.addressMapOut(result[0]), result[1]]);
    return Object.fromEntries(parsedEntries);
  }

  private parseHistoricalPrices(
    results: HistoricalPriceResponse[],
    addresses: string[],
    start: number,
    aggregateBy: 'day' | 'hour' = 'day'
  ): HistoricalPrices {
    const assetPrices = Object.fromEntries(
      addresses.map((address, index) => {
        address = this.addressMapOut(address);
        const result = results[index].prices;
        const prices = {};

        if (aggregateBy === 'hour') {
          const pricesByHour = groupBy(result, r =>
            getUnixTime(startOfHour(fromUnixTime(r[0] / 1000)))
          );
          for (const key of Object.keys(pricesByHour)) {
            const price = (last(pricesByHour[key]) || [])[1] || 0;
            prices[Number(key) * 1000] = price;
          }
        } else if (aggregateBy === 'day') {
          for (const key in result) {
            const [timestamp, price] = result[key];
            prices[timestamp] = price;
          }
        }

        return [address, prices];
      })
    );

    const prices = {};
    for (const asset in assetPrices) {
      const assetPrice = assetPrices[asset];
      for (const timestamp in assetPrice) {
        const price = assetPrice[timestamp];
        if (!(timestamp in prices)) {
          prices[timestamp] = [];
        }
        prices[timestamp].push(price);
      }
    }
    return prices;
  }

  /**
   * Map address to mainnet address if app network is a testnet
   */
  @returnChecksum()
  public addressMapIn(address: string): string {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return addressMap[address.toLowerCase()] || address;
  }

  /**
   * Map mainnet address back to testnet address
   */
  @returnChecksum()
  public addressMapOut(address: string): string {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return invert(addressMap)[address.toLowerCase()] || address;
  }
}
