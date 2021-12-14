import { getAddress } from '@ethersproject/address';

import { TokenPrices } from '@/services/coingecko/api/price.service';
import { Pool } from '@/services/balancer/subgraph/types';

import { FiatCurrency } from '@/constants/currency';

import { bnum } from '@/lib/utils';

import AaveSubgraphService, {
  aaveSubgraphService
} from './subgraph/aave-subgraph.service';

export default class AaveService {
  subgraphService: AaveSubgraphService;

  constructor(subgraphService = aaveSubgraphService) {
    this.subgraphService = subgraphService;
  }

  public async calcWeightedSupplyAPRFor(
    pool: Pool,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    let total = bnum(0);
    const tokenBreakdown = {};

    if (pool.mainTokens != null && pool.wrappedTokens != null) {
      const reserves = await this.subgraphService.reserves.get({
        where: {
          underlyingAsset_in: pool.mainTokens,
          isActive: true,
          aEmissionPerSecond_gt: 0
        }
      });

      reserves.forEach(reserve => {
        const supplyAPR = bnum(reserve.supplyAPR);

        if (
          pool.mainTokens != null &&
          pool.wrappedTokens != null &&
          supplyAPR.gt(0)
        ) {
          const tokenIndex = pool.mainTokens.findIndex(
            token => token === getAddress(reserve.underlyingAsset)
          );
          // Grabs the matching wrapped which generates the yield
          const wrappedToken = pool.wrappedTokens[tokenIndex];
          const mainToken = pool.mainTokens[tokenIndex];

          if (
            pool.linearPoolTokensMap != null &&
            pool.linearPoolTokensMap[wrappedToken] != null &&
            prices[mainToken] != null
          ) {
            const price = prices[mainToken][currency] || 0;
            const balance = pool.linearPoolTokensMap[wrappedToken].balance;
            const value = bnum(balance).times(price);
            const weightedAPR = value.times(supplyAPR).div(pool.totalLiquidity);

            tokenBreakdown[wrappedToken] = weightedAPR.toString();

            total = total.plus(weightedAPR);
          }
        }
      });
    }

    return {
      total: total.toString(),
      tokenBreakdown
    };
  }
}

export const aaveService = new AaveService();
