import { configService as _configService } from '@/services/config/config.service';
import axios from 'axios';
import {
  GqlHistoricalTokenPrice,
  GqlTokenPrice,
  GqlUserPortfolioData,
  GqlUserTokenData,
  UserPortfolio,
  UserPortfolioData,
  UserTokenData
} from './beethovenx-types';
import { getAddress } from '@ethersproject/address';
import { keyBy } from 'lodash';

export type Price = { [fiat: string]: number };
export type TokenPrices = { [address: string]: Price };
export type HistoricalPrices = { [timestamp: string]: number[] };

export interface BeethovenxConfig {
  incentivizedPools: string[];
  pausedPools: string[];
  blacklistedPools: string[];
  featuredPools: string[];
}

export default class BeethovenxService {
  private readonly url: string;

  constructor(private readonly configService = _configService) {
    this.url =
      configService.env.BACKEND_URL || configService.network.backendUrl;
  }

  public async getUserPortfolio(address: string): Promise<UserPortfolio> {
    const query = `
      query {
        portfolio: portfolioGetUserPortfolio {
          ...GqlUserPortfolioData
        }
        history: portfolioGetUserPortfolioHistory {
          ...GqlUserPortfolioData
        }
      }
      
      ${this.userProfileDataFragment}
    `;

    const response = await this.get<{
      portfolio: GqlUserPortfolioData;
      history: GqlUserPortfolioData[];
    }>(query, address);

    return {
      portfolio: this.mapPortfolioData(response.portfolio),
      history: response.history.map(item => this.mapPortfolioData(item))
    };
  }

  public async getTokenPrices(): Promise<TokenPrices> {
    const query = `
      query {
        tokenPrices: tokenPriceGetCurrentPrices {
          price
          address
        }
      }
    `;

    const response = await this.get<{
      tokenPrices: GqlTokenPrice[];
    }>(query);

    if (!response) {
      return {};
    }

    const result: TokenPrices = {};

    for (const tokenPrice of response.tokenPrices) {
      result[getAddress(tokenPrice.address)] = { usd: tokenPrice.price };
    }

    return result;
  }

  public async getHistoricalTokenPrices(
    addresses: string[]
  ): Promise<HistoricalPrices> {
    const lowerCaseAddresses = addresses.map(address => address.toLowerCase());

    const query = `
      query {
        tokenPrices: tokenPriceGetHistoricalPrices(addresses: ["${lowerCaseAddresses.join(
          '","'
        )}"]) {
          address
          prices {
            timestamp
            price
          }
        }
      }
    `;

    const { tokenPrices } = await this.get<{
      tokenPrices: GqlHistoricalTokenPrice[];
    }>(query);
    const timestamps =
      tokenPrices[0]?.prices.map(price => price.timestamp) || [];

    const result: HistoricalPrices = {};
    const tokenPricesMap = keyBy(tokenPrices, 'address');

    for (const timestamp of timestamps) {
      result[timestamp] = lowerCaseAddresses.map(address => {
        const entry = tokenPricesMap[address].prices.find(
          price => price.timestamp === timestamp
        );

        return entry?.price || 0;
      });
    }

    return result;
  }

  public async getBeethovenxConfig(): Promise<BeethovenxConfig> {
    const { data } = await axios.get<{ result: BeethovenxConfig }>(
      this.configService.network.configSanityUrl
    );

    return data.result;
  }

  private async get<T>(query: string, address?: string): Promise<T> {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            AccountAddress: address
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private get userProfileDataFragment() {
    return `
      fragment GqlUserPortfolioData on GqlUserPortfolioData {
        timestamp
        totalSwapFees
        totalSwapVolume
        totalValue
        myFees
        pools {
          id
          myFees
          name
          percentOfPortfolio
          percentShare
          poolAddress
          poolId
          priceChange
          priceChangePercent
          pricePerShare
          shares
          swapFees
          swapVolume
          tokens {
            address
            balance
            id
            name
            percentOfPortfolio
            pricePerToken
            symbol
            totalValue
          }
          totalValue
        }
        tokens {
          address
          balance
          id
          name
          percentOfPortfolio
          pricePerToken
          symbol
          totalValue
        }
      }
    `;
  }

  public mapPortfolioData(data: GqlUserPortfolioData): UserPortfolioData {
    return {
      ...data,
      totalValue: parseFloat(data.totalValue),
      totalSwapFees: parseFloat(data.totalSwapFees),
      totalSwapVolume: parseFloat(data.totalSwapVolume),
      myFees: parseFloat(data.myFees),
      pools: data.pools.map(pool => ({
        ...pool,
        totalValue: parseFloat(pool.totalValue),
        swapFees: parseFloat(pool.swapFees),
        swapVolume: parseFloat(pool.swapVolume),
        myFees: parseFloat(pool.myFees),
        priceChange: parseFloat(pool.priceChange),
        pricePerShare: parseFloat(pool.pricePerShare),
        shares: parseFloat(pool.shares),
        tokens: pool.tokens.map(token => this.mapUserTokenData(token))
      })),
      tokens: data.tokens.map(token => this.mapUserTokenData(token))
    };
  }

  private mapUserTokenData(token: GqlUserTokenData): UserTokenData {
    return {
      ...token,
      balance: parseFloat(token.balance),
      pricePerToken: parseFloat(token.pricePerToken),
      totalValue: parseFloat(token.totalValue)
    };
  }
}

export const beethovenxService = new BeethovenxService();
