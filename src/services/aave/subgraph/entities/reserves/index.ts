import { ComputedReserveData, v2 } from '@aave/protocol-js';

import { TokenPrices } from '@/services/coingecko/api/price.service';
import { Pool } from '@/services/balancer/subgraph/types';

import { FiatCurrency } from '@/constants/currency';

import { bnum } from '@/lib/utils';

import Service from '../../aave-subgraph.service';

import queryBuilder from './query';

import { QueryBuilder } from '@/types';

export default class Reserves {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<ComputedReserveData[]> {
    const query = this.query(args, attrs);
    const { reserves } = await this.service.client.get(query);

    return v2.formatReserves(reserves);
  }

  public async calcWeightedSupplyAPRFor(
    pool: Pool,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    let total = bnum(0);
    const tokenBreakdown = {};

    if (pool.wrappedTokens != null) {
      const reserves = await this.service.reserves.get({
        where: {
          underlyingAsset_in: pool.mainTokens,
          isActive: true,
          aEmissionPerSecond_gt: 0
        }
      });

      if (reserves.length > 0) {
        reserves.forEach(reserve => {
          // @ts-ignore
          const token = getAddress(reserve.aToken.underlyingAssetAddress);

          if (
            pool.linearPoolTokensMap != null &&
            pool.linearPoolTokensMap[token] != null &&
            prices[token] != null
          ) {
            const price = prices[token][currency] || 0;
            const balance = pool.linearPoolTokensMap[token].balance;
            const value = bnum(balance).times(price);
            const weightedAPR = value
              .times(reserve.supplyAPR)
              .div(pool.totalLiquidity);

            tokenBreakdown[token] = weightedAPR.toString();

            total = total.plus(weightedAPR);
          }
        });
      }
    }

    return {
      total: total.toString(),
      tokenBreakdown
    };
  }
}
