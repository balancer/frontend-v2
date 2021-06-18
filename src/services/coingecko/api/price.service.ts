import { CoingeckoClient } from '../coingecko.client';
import { CoingeckoService } from '../coingecko.service';
import { TOKENS } from '@/constants/tokens';
import ConfigService from '@/services/config/config.service';
import { invert } from 'lodash';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';

// TYPES
export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };

export class PriceService {
  client: CoingeckoClient;
  fiatParam: string;
  baseEndpoint: string;
  appNetwork: string;

  constructor(
    service: CoingeckoService,
    private readonly configService = new ConfigService()
  ) {
    this.client = service.client;
    this.fiatParam = service.supportedFiat;
    this.baseEndpoint = '/simple';
    this.appNetwork = configService.network.key;
  }

  async getEther(): Promise<Price> {
    try {
      const { ethereum: price } = await this.client.get<PriceResponse>(
        `${this.baseEndpoint}/price?ids=ethereum&vs_currencies=${this.fiatParam}`
      );
      return price;
    } catch (error) {
      console.error('Unable to fetch Ether price', error);
      throw error;
    }
  }

  async getTokens(addresses: string[]): Promise<TokenPrices> {
    try {
      addresses = addresses.map(address => this.addressMapIn(address));
      const max = 100;
      const pages = Math.ceil(addresses.length / max);
      const requests: Promise<PriceResponse>[] = [];
      Array.from(Array(pages).keys()).forEach(page => {
        const addressString = addresses.slice(max * page, max * (page + 1));
        const endpoint = `${this.baseEndpoint}/token_price/ethereum?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
        requests.push(this.client.get<PriceResponse>(endpoint));
      });
      const paginatedResults = await Promise.all(requests);
      return this.parsePaginatedTokens(paginatedResults);
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
