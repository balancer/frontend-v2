import { getAddress } from '@ethersproject/address';

import { isStable } from '@/composables/usePool';

import Service from '../../balancer-subgraph.service';
import queryBuilder, { pastPoolsQuery } from './query';
import { DecoratedPool, Pool, PoolToken, QueryBuilder } from '../../types';

import { Network } from '@/composables/useNetwork';
import {
  configService,
  configService as _configService
} from '@/services/config/config.service';
import PoolService from '@/services/pool/pool.service';
import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { cloneDeep, orderBy } from 'lodash';

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: Network;
  pools: Pool[] = [];
  lastPoolsFetch: number | null = null;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = _configService,
    private readonly poolServiceClass = PoolService
  ) {
    this.service = service;
    this.query = query;
    this.networkId = configService.env.NETWORK;
  }

  public async get(): Promise<Pool[]> {
    const timestamp = Math.floor(Date.now() / 1000);

    if (
      this.pools.length > 0 &&
      this.lastPoolsFetch &&
      timestamp < this.lastPoolsFetch + 15
    ) {
      return cloneDeep(this.pools);
    }

    const query = this.query();

    try {
      const {
        data: { data }
      } = await axios.post(this.configService.network.poolsUrlV2, {
        query: jsonToGraphQLQuery({ query })
      });

      this.pools = cloneDeep(data.pools);

      this.lastPoolsFetch = timestamp;
      return data.pools;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async getPastPools(): Promise<Pool[]> {
    const query = pastPoolsQuery();

    try {
      const {
        data: { data }
      } = await axios.post(this.configService.network.poolsUrlV2, {
        query: jsonToGraphQLQuery({ query })
      });

      return data.poolsPastPools;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async getPoolDataFromTxHash(
    txHash: string
  ): Promise<{
    id: string;
    address: string;
    poolType: string;
    owner: string;
  } | null> {
    try {
      const {
        data: { data }
      } = await axios.post(this.configService.network.subgraph, {
        query: jsonToGraphQLQuery({
          query: {
            pools: {
              __args: { where: { tx: txHash } },
              id: true,
              address: true,
              poolType: true,
              owner: true
            }
          }
        })
      });

      return data?.pools[0] || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async decorate(pools: Pool[]): Promise<DecoratedPool[]> {
    return this.serialize(pools);
  }

  private async serialize(pools: Pool[]): Promise<DecoratedPool[]> {
    const promises = pools.map(async pool => {
      if (
        pool.id ===
        '0xae1c69eae0f1342425ea3fdb51e9f11223c7ad5b00010000000000000000000b'
      ) {
        pool.name = `*PAUSED* ${pool.name} - Please migrate to new pool`;
      } else if (
        pool.id ===
        '0xd163415bd34ef06f57c58d2aed5a5478afb464cc00000000000000000000000e'
      ) {
        pool.name = `Ziggy Stardust & Magic Internet Money`;
      } else if (
        pool.id ===
          '0x5018fa8aa910fa2eea07529d80e7a44b2e2d29cf000100000000000000000022' ||
        pool.id ===
          '0xe2fd25b84aa76486e0cbc2c2ca383c3587abb942000100000000000000000028'
      ) {
        pool.name = `*DEPRECATED* ${pool.name} - Please migrate to the Beethoven-X pool`;
      }
      if (
        pool.id ===
        '0x2c580c6f08044d6dfaca8976a66c8fadddbd9901000000000000000000000038'
      ) {
        pool.name = 'Guqin Qi V2';
      }

      pool.address = this.addressFor(pool.id);
      pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));

      if (pool.mainTokens) {
        const bbUsd = configService.network.addresses.bbUsd.toLowerCase();
        const linearPools = pool.linearPools || [];

        pool.mainTokens = orderBy(
          pool.mainTokens,
          mainToken => {
            if (pool.tokensList.includes(mainToken)) {
              return pool.tokensList.indexOf(mainToken);
            } else if (
              configService.network.usdTokens.includes(getAddress(mainToken)) &&
              pool.tokensList.includes(bbUsd)
            ) {
              return pool.tokensList.indexOf(bbUsd);
            }

            const linearPool = linearPools.find(
              linearPool => linearPool.mainToken.address === mainToken
            );

            if (linearPool) {
              return pool.tokensList.indexOf(linearPool.address);
            }

            return 0;
          },
          'asc'
        );

        pool.mainTokens = pool.mainTokens.map(t => getAddress(t));
      }

      pool.tokens = this.formatPoolTokens(pool);

      return pool;
    });

    return Promise.all(promises);
  }

  private formatPoolTokens(pool: Pool): PoolToken[] {
    const tokens = pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(pool.poolType)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  }

  public addressFor(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
