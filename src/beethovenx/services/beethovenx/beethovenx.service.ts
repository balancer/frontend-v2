import { configService as _configService } from '@/services/config/config.service';
import axios from 'axios';
import {
  CreateLgeTypes,
  GqlBalancerPoolActivity,
  GqlBalancerPoolSnapshot,
  GqlBeetsConfig,
  GqlBeetsFarm,
  GqlBeetsFarmUser,
  GqlBeetsProtocolData,
  GqlHistoricalTokenPrice,
  GqlLge,
  GqlLgeCreateInput,
  GqlSorGetSwapsInput,
  GqlSorGetSwapsResponse,
  GqlTokenPrice,
  GqlUserPortfolioData,
  GqlUserTokenData,
  UserPortfolio,
  UserPortfolioData,
  UserTokenData
} from './beethovenx-types';
import { getAddress, isAddress } from '@ethersproject/address';
import { keyBy } from 'lodash';
import { Web3Provider } from '@ethersproject/providers';
import { EnumType, jsonToGraphQLQuery } from 'json-to-graphql-query';
import { SwapInfo } from '@balancer-labs/sdk';
import { BigNumber } from '@ethersproject/bignumber';

export type Price = { [fiat: string]: number };
export type TokenPrices = { [address: string]: Price };
export type HistoricalPrices = { [timestamp: string]: number[] };

export default class BeethovenxService {
  private readonly url: string;
  private tokenPrices: TokenPrices = {};
  private config: GqlBeetsConfig = {
    blacklistedTokens: [],
    blacklistedPools: [],
    homeEducationItems: [],
    homeNewsItems: [],
    homeFeaturedPools: [],
    featuredPools: [],
    incentivizedPools: [],
    poolFilters: [],
    pausedPools: [],
    boostedPools: []
  };

  private farms: GqlBeetsFarm[] = [];
  private lastFarmsFetch: null | number = null;
  private farmUsers: GqlBeetsFarmUser[] = [];
  private lastFarmUsersFetch: null | number = null;

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
      if (isAddress(tokenPrice.address)) {
        result[getAddress(tokenPrice.address)] = { usd: tokenPrice.price };
      }
    }

    this.tokenPrices = result;

    return result;
  }

  public getCachedTokenPrices(): TokenPrices {
    return this.tokenPrices;
  }

  public getCachedConfig(): GqlBeetsConfig {
    return this.config;
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

  public async getBeethovenxConfig(): Promise<GqlBeetsConfig> {
    const query = jsonToGraphQLQuery({
      query: {
        beetsGetConfig: {
          incentivizedPools: true,
          pausedPools: true,
          blacklistedPools: true,
          blacklistedTokens: true,
          featuredPools: true,
          boostedPools: true,
          homeFeaturedPools: {
            poolId: true,
            image: true,
            description: true
          },
          homeNewsItems: {
            title: true,
            url: true,
            image: true,
            description: true,
            publishDate: true
          },
          homeEducationItems: {
            title: true,
            url: true,
            image: true,
            description: true,
            publishDate: true
          },
          poolFilters: {
            id: true,
            title: true,
            pools: true
          }
        }
      }
    });

    const response = await this.get<{ beetsGetConfig: GqlBeetsConfig }>(query);

    this.config = response.beetsGetConfig;

    return response.beetsGetConfig;
  }

  public async createLge(
    web3: Web3Provider,
    input: GqlLgeCreateInput,
    account: string
  ): Promise<{ id: string }> {
    /*const signature = await web3.getSigner()._signTypedData(
      {
        name: 'beethovenx',
        version: '1',
        chainId: this.configService.network.chainId
      },
      CreateLgeTypes,
      input
    );*/

    const query = jsonToGraphQLQuery({
      mutation: {
        lgeCreate: {
          __args: { signature: '', lge: input },
          id: true,
          address: true,
          name: true
        }
      }
    });

    return this.get<{ id: string }>(query, account);
  }

  public async getLge(id: string): Promise<GqlLge> {
    const query = jsonToGraphQLQuery({
      query: {
        lge: {
          __args: { id },
          ...this.lgeQueryFields
        }
      }
    });

    const response = await this.get<{ lge: GqlLge }>(query);

    return response.lge;
  }

  public async getLges(): Promise<GqlLge[]> {
    const query = jsonToGraphQLQuery({
      query: { lges: this.lgeQueryFields }
    });

    const response = await this.get<{ lges: GqlLge[] }>(query);

    return response.lges;
  }

  public async isAddressMultisigWallet(address: string): Promise<boolean> {
    const query = jsonToGraphQLQuery({
      query: { gnosisIsUserMultisigWallet: true }
    });

    const response = await this.get<{ gnosisIsUserMultisigWallet: boolean }>(
      query,
      address
    );

    return response.gnosisIsUserMultisigWallet;
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

  public async getFbeetsApr(): Promise<number> {
    const query = jsonToGraphQLQuery({
      query: {
        fbeetsGetApr: {
          apr: true
        }
      }
    });

    const { fbeetsGetApr } = await this.get<{ fbeetsGetApr: { apr: number } }>(
      query
    );

    return fbeetsGetApr.apr;
  }

  public async getProtocolData(): Promise<GqlBeetsProtocolData> {
    const query = jsonToGraphQLQuery({
      query: {
        beetsGetProtocolData: {
          marketCap: true,
          beetsPrice: true,
          totalSwapFee: true,
          totalLiquidity: true,
          totalSwapVolume: true,
          poolCount: true,
          circulatingSupply: true,
          swapFee24h: true,
          swapVolume24h: true
        }
      }
    });

    const { beetsGetProtocolData } = await this.get<{
      beetsGetProtocolData: GqlBeetsProtocolData;
    }>(query);

    return beetsGetProtocolData;
  }

  public async getPoolSnapshots(
    poolId: string
  ): Promise<GqlBalancerPoolSnapshot[]> {
    const query = jsonToGraphQLQuery({
      query: {
        poolSnapshots: {
          __args: { poolId },
          id: true,
          poolId: true,
          swapFees24h: true,
          swapVolume24h: true,
          liquidityChange24h: true,
          totalShares: true,
          totalSwapFee: true,
          totalLiquidity: true,
          totalSwapVolume: true,
          timestamp: true,
          tokens: {
            address: true,
            balance: true
          }
        }
      }
    });

    const { poolSnapshots } = await this.get<{
      poolSnapshots: GqlBalancerPoolSnapshot[];
    }>(query);

    return poolSnapshots;
  }

  public async getAverageBlockTime(): Promise<number> {
    const query = jsonToGraphQLQuery({
      query: { blocksGetAverageBlockTime: true }
    });

    const { blocksGetAverageBlockTime } = await this.get<{
      blocksGetAverageBlockTime: number;
    }>(query);

    return blocksGetAverageBlockTime;
  }

  public async getBalancerPoolActivities(input: {
    poolId: string;
    first: number;
    skip: number;
    sender?: string;
  }): Promise<GqlBalancerPoolActivity[]> {
    const query = jsonToGraphQLQuery({
      query: {
        balancerGetPoolActivities: {
          __args: { input },
          id: true,
          amounts: true,
          poolId: true,
          sender: true,
          timestamp: true,
          tx: true,
          type: true,
          valueUSD: true
        }
      }
    });

    const { balancerGetPoolActivities } = await this.get<{
      balancerGetPoolActivities: GqlBalancerPoolActivity[];
    }>(query);

    return balancerGetPoolActivities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp * 1000
    }));
  }

  public async getBeetsFarms(): Promise<GqlBeetsFarm[]> {
    const timestamp = Math.floor(Date.now() / 1000);

    if (
      this.farms.length > 0 &&
      this.lastFarmsFetch &&
      timestamp < this.lastFarmsFetch + 30
    ) {
      return this.farms;
    }

    const query = jsonToGraphQLQuery({
      query: {
        beetsGetBeetsFarms: {
          id: true,
          pair: true,
          allocPoint: true,
          slpBalance: true,
          masterChef: {
            id: true,
            totalAllocPoint: true,
            beetsPerBlock: true
          },
          rewarder: {
            id: true,
            rewardToken: true,
            rewardPerSecond: true,
            tokens: {
              token: true,
              symbol: true,
              tokenPrice: true,
              rewardPerSecond: true
            }
          }
        }
      }
    });

    const { beetsGetBeetsFarms } = await this.get<{
      beetsGetBeetsFarms: GqlBeetsFarm[];
    }>(query);

    this.lastFarmsFetch = timestamp;
    this.farms = beetsGetBeetsFarms;

    return beetsGetBeetsFarms;
  }

  public async getUserDataForFarm(
    farmId: string,
    userAddress: string
  ): Promise<GqlBeetsFarmUser> {
    const query = jsonToGraphQLQuery({
      query: {
        beetsGetUserDataForFarm: {
          __args: { farmId },
          id: true,
          address: true,
          amount: true,
          beetsHarvested: true,
          farmId: true,
          rewardDebt: true,
          timestamp: true
        }
      }
    });

    const { beetsGetUserDataForFarm } = await this.get<{
      beetsGetUserDataForFarm: GqlBeetsFarmUser | null;
    }>(query, userAddress);

    return beetsGetUserDataForFarm
      ? beetsGetUserDataForFarm
      : {
          id: '',
          address: '',
          amount: '0',
          beetsHarvested: '0',
          rewardDebt: '0',
          timestamp: '',
          farmId
        };
  }

  public async getUserDataForAllFarms(
    userAddress: string
  ): Promise<GqlBeetsFarmUser[]> {
    const timestamp = Math.floor(Date.now() / 1000);

    if (
      this.farmUsers.length > 0 &&
      this.lastFarmUsersFetch &&
      timestamp < this.lastFarmUsersFetch + 10
    ) {
      return this.farmUsers;
    }

    const query = jsonToGraphQLQuery({
      query: {
        beetsGetUserDataForAllFarms: {
          id: true,
          address: true,
          amount: true,
          beetsHarvested: true,
          farmId: true,
          rewardDebt: true,
          timestamp: true
        }
      }
    });

    const { beetsGetUserDataForAllFarms } = await this.get<{
      beetsGetUserDataForAllFarms: GqlBeetsFarmUser[];
    }>(query, userAddress);

    this.lastFarmsFetch = timestamp;
    this.farmUsers = beetsGetUserDataForAllFarms;

    return beetsGetUserDataForAllFarms;
  }

  public async sorGetSwaps(input: GqlSorGetSwapsInput): Promise<SwapInfo> {
    const query = jsonToGraphQLQuery({
      query: {
        sorGetSwaps: {
          __args: {
            input: { ...input, swapType: new EnumType(input.swapType) }
          },
          tokenIn: true,
          tokenOut: true,
          tokenAddresses: true,
          swapAmount: true,
          swapAmountForSwaps: true,
          returnAmount: true,
          returnAmountFromSwaps: true,
          returnAmountConsideringFees: true,
          marketSp: true,
          swaps: {
            poolId: true,
            amount: true,
            userData: true,
            assetInIndex: true,
            assetOutIndex: true
          },
          routes: {
            tokenIn: true,
            tokenOut: true,
            tokenInAmount: true,
            tokenOutAmount: true,
            share: true,
            hops: {
              poolId: true,
              tokenIn: true,
              tokenOut: true,
              tokenInAmount: true,
              tokenOutAmount: true
            }
          }
        }
      }
    });

    const { sorGetSwaps } = await this.get<{
      sorGetSwaps: GqlSorGetSwapsResponse;
    }>(query);

    return {
      ...sorGetSwaps,
      swapAmount: BigNumber.from(sorGetSwaps.swapAmount),
      swapAmountForSwaps: sorGetSwaps.swapAmountForSwaps
        ? BigNumber.from(sorGetSwaps.swapAmountForSwaps)
        : undefined,
      returnAmount: BigNumber.from(sorGetSwaps.returnAmount),
      returnAmountFromSwaps: sorGetSwaps.returnAmountFromSwaps
        ? BigNumber.from(sorGetSwaps.returnAmountFromSwaps)
        : undefined,
      returnAmountConsideringFees: BigNumber.from(
        sorGetSwaps.returnAmountConsideringFees
      )
    };
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

  private get lgeQueryFields() {
    return {
      address: true,
      collateralAmount: true,
      collateralEndWeight: true,
      collateralStartWeight: true,
      collateralTokenAddress: true,
      description: true,
      discordUrl: true,
      endDate: true,
      id: true,
      mediumUrl: true,
      name: true,
      startDate: true,
      swapFeePercentage: true,
      telegramUrl: true,
      tokenAmount: true,
      tokenContractAddress: true,
      tokenEndWeight: true,
      tokenIconUrl: true,
      tokenStartWeight: true,
      twitterUrl: true,
      websiteUrl: true,
      bannerImageUrl: true,
      adminAddress: true,
      adminIsMultisig: true
    };
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
