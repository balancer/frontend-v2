import { getApi } from '@/dependencies/balancer-api';
import { Pool, PoolToken } from '@/services/pool/types';

import Service from '../../balancer-api.service';
import {
  GetPoolQuery,
  GqlPoolTokenLinear,
  GqlPoolUnion,
} from '@/services/api/graphql/generated/api-types';
import { mapApiChain } from '@/lib/utils/api';
import { PoolType } from '@balancer-labs/sdk';
import { getPoolTypeFromFactoryAddress } from '@/lib/utils/pool';

export type ApiPool = GetPoolQuery['pool'];

export interface ApiArgs {
  id: string;
}

export default class SinglePool {
  service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  public async get(args: ApiArgs): Promise<Pool> {
    const api = getApi();
    const id = args.id;

    console.log('Getting pool from API');
    const response = await api.GetPool({ id });
    const pool: GqlPoolUnion = response.pool as GqlPoolUnion;
    console.log('Got pool from API: ', pool);

    const convertedPool: Pool = this.mapPool(pool);

    return convertedPool;
  }

  mapPool(apiPool: GqlPoolUnion): Pool {
    const converted: Pool = {
      id: apiPool.id,
      name: apiPool.name || '',
      address: apiPool.address,
      chainId: mapApiChain(apiPool.chain),
      poolType: PoolType.Weighted, // mapApiPoolType(apiPool.type) || PoolType.Weighted,,
      poolTypeVersion: 1, // apiPool.version || 1,
      swapFee: apiPool.dynamicData.swapFee,
      swapEnabled: apiPool.dynamicData.swapEnabled,
      protocolYieldFeeCache: '0.5', // Default protocol yield fee
      protocolSwapFeeCache: '0.5', // Default protocol swap fee
      // amp: apiPool.amp ?? undefined,
      owner: apiPool.owner ?? undefined,
      factory: apiPool.factory ?? undefined,
      symbol: apiPool.symbol ?? undefined,
      tokens: ((apiPool.tokens as GqlPoolTokenLinear[]) || [])
        .map(this.mapToken.bind(this))
        .filter(token => token.address !== apiPool.address),
      tokensList: (apiPool.displayTokens || [])
        .map(t => t.address)
        .filter(address => address !== apiPool.address),
      tokenAddresses: (apiPool.displayTokens || [])
        .map(t => t.address)
        .filter(address => address !== apiPool.address),
      totalLiquidity: apiPool.dynamicData.totalLiquidity,
      totalShares: apiPool.dynamicData.totalShares,
      totalSwapFee: apiPool.dynamicData.lifetimeSwapFees,
      totalSwapVolume: apiPool.dynamicData.lifetimeVolume,
      apr: apiPool.dynamicData.apr,
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

    return converted;
  }

  private mapToken(apiToken: GqlPoolTokenLinear): PoolToken {
    const subTokens: PoolToken['token'] = { pool: null };
    if (apiToken.pool) {
      subTokens.pool = {
        id: apiToken.pool.id,
        address: apiToken.pool.address,
        poolType: apiToken.pool.factory
          ? getPoolTypeFromFactoryAddress(apiToken.pool.factory)
          : PoolType.Weighted,
        mainIndex: apiToken.pool.mainIndex,
        totalShares: apiToken.pool.totalShares,
        tokens: (apiToken.pool.tokens as any[]).map(this.mapToken.bind(this)),
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
