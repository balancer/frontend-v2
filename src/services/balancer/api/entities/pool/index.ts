import { getApi } from '@/dependencies/balancer-api';
import { Pool, PoolToken } from '@/services/pool/types';

import Service from '../../balancer-api.service';
import {
  GetPoolQuery,
  GqlPoolApr,
  GqlPoolTokenUnion,
} from '@/services/api/graphql/generated/api-types';
import { mapApiChain } from '@/lib/utils/api';
import { AprBreakdown, PoolType } from '@balancer-labs/sdk';

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
    const pool: ApiPool = response.pool;
    console.log('Got pool from API: ', pool);

    const convertedPool: Pool = this.mapPool(pool);

    return convertedPool;
  }

  mapPool(apiPool: ApiPool): Pool {
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
      tokens: ((apiPool.tokens as GqlPoolTokenUnion[]) || [])
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

    return converted;
  }

  private mapToken(apiToken: GqlPoolTokenUnion): PoolToken {
    return {
      address: apiToken.address,
      balance: apiToken.balance,
      priceRate: apiToken.priceRate,
      weight: apiToken.weight,
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
}
