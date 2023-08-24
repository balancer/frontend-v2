import { getApi } from '@/dependencies/balancer-api';
import { Pool } from '@/services/pool/types';
import { GetPoolsQuery } from '@/services/api/graphql/generated/api-types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import {
  GraphQLQuery,
  PoolToken,
  PoolType,
  PoolsBalancerAPIRepository,
} from '@balancer-labs/sdk';

import Service from '../../balancer-api.service';
import queryBuilder from './query';
import { mapApiChain, mapApiPoolType } from '@/lib/utils/api';

export type ApiPools = GetPoolsQuery['pools'];
export type ApiPool = ApiPools[number];

export default class Pools {
  service: Service;
  queryBuilder: PoolsQueryBuilder;
  lastQuery?: GraphQLQuery;
  repository?: PoolsBalancerAPIRepository;

  constructor(
    service: Service,
    _queryBuilder: PoolsQueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.queryBuilder = _queryBuilder;
  }

  public async get(): Promise<Pool[]> {
    const api = getApi();
    const response = await api.GetPools();
    const pools: ApiPools = response.pools;

    const convertedPools: Pool[] = pools.map((pool: ApiPool) => {
      return this.mapPool(pool);
    });

    return convertedPools;

    // const query = this.queryBuilder(args, attrs);
    // const skip = query.args.skip;
    // const first = query.args.first;
    // delete query.args.skip; // not allowed for Balancer API
    // delete query.args.first;

    // /* Some temporary hacks to make the API work with an empty in array (it should return no data)
    //  *   and if not_in is also set then delete it (because it's set by default) */
    // if (query.args.where?.id?.in) {
    //   if (query.args.where?.id?.in.length === 0) {
    //     return [];
    //   }
    //   if (query.args.where?.id?.not_in) {
    //     delete query.args.where?.id.not_in;
    //   }
    // }

    // if (!this.repository || !_.isEqual(query, this.lastQuery)) {
    //   this.lastQuery = _.cloneDeep(query);
    //   const graphQLUrl = `${configService.network.balancerApi}/graphql`;
    //   this.repository = new PoolsBalancerAPIRepository({
    //     url: graphQLUrl,
    //     apiKey: configService.network.keys.balancerApi || '',
    //     query: query,
    //   });
    // }

    // const pools = await this.repository.fetch({
    //   first,
    //   skip,
    // });

    // return pools as Pool[];
  }

  // Converts a pool from the API subgraph to frontend pool type
  private mapPool(apiPool: ApiPool): Pool {
    return {
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
      tokens: (apiPool.allTokens || []).map(this.mapToken),
      tokensList: (apiPool.allTokens || []).map(t => t.address),
      tokenAddresses: (apiPool.allTokens || []).map(t => t.address),
      totalLiquidity: apiPool.dynamicData.totalLiquidity,
      totalShares: apiPool.dynamicData.totalShares,
      totalSwapFee: apiPool.dynamicData.lifetimeSwapFees,
      totalSwapVolume: apiPool.dynamicData.lifetimeVolume,
      // priceRateProviders: apiPool.priceRateProviders ?? undefined,
      // onchain: subgraphPool.onchain,
      createTime: apiPool.createTime,
      // mainIndex: apiPool.mainIndex ?? undefined,
      // wrappedIndex: apiPool.wrappedIndex ?? undefined,
      // mainTokens: subgraphPool.mainTokens,
      // wrappedTokens: subgraphPool.wrappedTokens,
      // unwrappedTokens: subgraphPool.unwrappedTokens,
      // isNew: subgraphPool.isNew,
      // volumeSnapshot: subgraphPool.volumeSnapshot,
      // feesSnapshot: subgraphPool.???, // Approximated last 24h fees
      // boost: subgraphPool.boost,
      totalWeight: '1',
      lowerTarget: '0',
      upperTarget: '0',
      // isInRecoveryMode: apiPool.isInRecoveryMode ?? false,
      // isPaused: apiPool.isPaused ?? false,
    };
  }

  private mapToken(apiToken: ApiPool['allTokens'][number]): PoolToken {
    return {
      address: apiToken.address,
      balance: '0',
    };
  }

  get skip(): number {
    return this.repository ? this.repository.skip : 0;
  }
}
