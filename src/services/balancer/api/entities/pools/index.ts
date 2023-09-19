import { configService } from '@/services/config/config.service';
import { getApi } from '@/dependencies/balancer-api';
import { Pool } from '@/services/pool/types';
import {
  GetPoolsQuery,
  GqlPoolFilter,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolTokenDisplay,
} from '@/services/api/graphql/generated/api-types';
import {
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
    const response = await api.GetPools({
      first: args.first || 10,
      skip: args.skip || 0,
      orderBy: args.orderBy || GqlPoolOrderBy.TotalLiquidity,
      orderDirection: args.orderDirection || GqlPoolOrderDirection.Desc,
      where: args.where,
    });
    const pools: ApiPools = response.pools;

    // Temp until I get pools by network ID from the beets API
    const filteredPools: ApiPools = pools.filter((pool: ApiPool) => {
      const poolChain: Network = mapApiChain(pool.chain);
      return poolChain === configService.network.chainId;
    });

    const convertedPools: Pool[] = filteredPools.map((pool: ApiPool) => {
      return this.mapPool(pool);
    });
    return convertedPools;
  }

  // Converts a pool from the API to frontend pool type
  private mapPool(apiPool: ApiPool): Pool {
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
      tokens: (apiPool.displayTokens || []).map(this.mapToken.bind(this)),
      tokensList: (apiPool.displayTokens || []).map(t => t.address),
      tokenAddresses: (apiPool.displayTokens || []).map(t => t.address),
      totalLiquidity: apiPool.dynamicData.totalLiquidity,
      totalShares: apiPool.dynamicData.totalShares,
      totalSwapFee: apiPool.dynamicData.lifetimeSwapFees,
      totalSwapVolume: apiPool.dynamicData.lifetimeVolume,
      apr: apiPool.dynamicData.apr,
      createTime: apiPool.createTime,
      volumeSnapshot: apiPool.dynamicData.volume24h,
      feesSnapshot: apiPool.dynamicData.fees24h,
      totalWeight: '1',
      lowerTarget: '0',
      upperTarget: '0',
    };
    return converted;
  }

  private mapToken(apiToken: GqlPoolTokenDisplay): PoolToken {
    const subTokens: PoolToken['token'] = { pool: null };
    if (apiToken.nestedTokens) {
      subTokens.pool = {
        id: apiToken.id,
        address: apiToken.address,
        poolType: PoolType.Weighted, // TODO: Add to API
        mainIndex: 1, // TODO: Add to API
        totalShares: '1', // TODO: Add to API
        tokens: apiToken.nestedTokens.map(this.mapToken.bind(this)),
      };
    }
    return {
      address: apiToken.address,
      weight: apiToken.weight,
      balance: '0',
      token: subTokens,
    };
  }
}
