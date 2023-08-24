import { configService } from '@/services/config/config.service';
import { getApi } from '@/dependencies/balancer-api';
import { Pool } from '@/services/pool/types';
import {
  GetPoolsQuery,
  GqlPoolApr,
  GqlPoolFilter,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolTokenExpanded,
} from '@/services/api/graphql/generated/api-types';
import {
  AprBreakdown,
  GraphQLQuery,
  PoolToken,
  PoolType,
  PoolsBalancerAPIRepository,
} from '@balancer-labs/sdk';
import { Network } from '@/lib/config/types';

import Service from '../../balancer-api.service';
import { mapApiChain, mapApiPoolType } from '@/lib/utils/api';

export type ApiPools = GetPoolsQuery['pools'];
export type ApiPool = ApiPools[number];

export interface ApiArgs {
  first?: number;
  skip?: number;
  orderBy?: GqlPoolOrderBy;
  orderDirection?: GqlPoolOrderDirection;
  where?: GqlPoolFilter;
}

export default class Pools {
  service: Service;
  lastQuery?: GraphQLQuery;
  repository?: PoolsBalancerAPIRepository;

  constructor(service: Service) {
    this.service = service;
  }

  public async get(args: ApiArgs = {}): Promise<Pool[]> {
    const api = getApi();
    console.log('Getting pools from API');
    const response = await api.GetPools({
      first: args.first || 10,
      skip: args.skip || 0,
      orderBy: args.orderBy || GqlPoolOrderBy.TotalLiquidity,
      orderDirection: args.orderDirection || GqlPoolOrderDirection.Desc,
      where: args.where,
    });
    const pools: ApiPools = response.pools;
    console.log('Got pools from API', pools);

    // Temp until I get pools by network ID from the beets API
    const filteredPools: ApiPools = pools.filter((pool: ApiPool) => {
      const poolChain: Network = mapApiChain(pool.chain);
      return poolChain === configService.network.chainId;
    });

    console.log('Converting pools');
    const convertedPools: Pool[] = filteredPools.map((pool: ApiPool) => {
      console.log('Converting pool ', pool.id);
      return this.mapPool(pool);
    });
    console.log('Done converting, pools is: ', convertedPools);

    return convertedPools;
  }

  // Converts a pool from the API subgraph to frontend pool type
  private mapPool(apiPool: ApiPool): Pool {
    console.log('Mapping pool: ', apiPool.id);
    if (
      apiPool.id ===
      '0xcde67b70e8144d7d2772de59845b3a67266c2ca7000200000000000000000009'
    ) {
      console.log('Full pool: ', apiPool);
    }
    const converted: Pool = {
      id: apiPool.id,
      name: apiPool.name || '',
      address: apiPool.address,
      chainId: mapApiChain(apiPool.chain),
      poolType: mapApiPoolType(apiPool.type) || PoolType.Weighted,
      poolTypeVersion: apiPool.version || 1,
      swapFee: apiPool.dynamicData.swapFee,
      swapEnabled: apiPool.dynamicData.swapEnabled,
      protocolYieldFeeCache: '0.5', // Default protocol yield fee
      protocolSwapFeeCache: '0.5', // Default protocol swap fee
      // amp: apiPool.amp ?? undefined,
      owner: apiPool.owner ?? undefined,
      factory: apiPool.factory ?? undefined,
      symbol: apiPool.symbol ?? undefined,
      tokens: (apiPool.allTokens || [])
        .map(this.mapToken)
        .filter(token => token.address !== apiPool.address),
      tokensList: (apiPool.allTokens || [])
        .map(t => t.address)
        .filter(address => address !== apiPool.address),
      tokenAddresses: (apiPool.allTokens || [])
        .map(t => t.address)
        .filter(address => address !== apiPool.address),
      totalLiquidity: apiPool.dynamicData.totalLiquidity,
      totalShares: apiPool.dynamicData.totalShares,
      totalSwapFee: apiPool.dynamicData.lifetimeSwapFees,
      totalSwapVolume: apiPool.dynamicData.lifetimeVolume,
      apr: this.mapApr(apiPool.dynamicData.apr),
      // priceRateProviders: apiPool.priceRateProviders ?? undefined,
      // onchain: subgraphPool.onchain,
      createTime: apiPool.createTime,
      // mainIndex: apiPool.mainIndex ?? undefined,
      // wrappedIndex: apiPool.wrappedIndex ?? undefined,
      // mainTokens: subgraphPool.mainTokens,
      // wrappedTokens: subgraphPool.wrappedTokens,
      // unwrappedTokens: subgraphPool.unwrappedTokens,
      // isNew: subgraphPool.isNew,
      volumeSnapshot: apiPool.dynamicData.volume24h,
      feesSnapshot: apiPool.dynamicData.fees24h,
      // boost: subgraphPool.boost,
      totalWeight: '1',
      lowerTarget: '0',
      upperTarget: '0',
      // isInRecoveryMode: apiPool.isInRecoveryMode ?? false,
      // isPaused: apiPool.isPaused ?? false,
    };
    console.log('Done on pool conversion');
    return converted;
  }

  private mapToken(apiToken: GqlPoolTokenExpanded): PoolToken {
    return {
      address: apiToken.address,
      balance: '0',
    };
  }

  private mapApr(apiApr: GqlPoolApr): AprBreakdown {
    console.log('Converting apr: ', apiApr);
    return {
      swapFees: Number(apiApr.swapApr) * 100,
      tokenAprs: {
        total: 0,
        breakdown: {},
      },
      stakingApr: {
        min: 0,
        max: 0,
      },
      rewardAprs: {
        total: 0,
        breakdown: {},
      },
      protocolApr: 0,
      min: Number(apiApr.apr) * 100,
      max: Number(apiApr.apr) * 100,
    };
  }

  get skip(): number {
    return this.repository ? this.repository.skip : 0;
  }
}
