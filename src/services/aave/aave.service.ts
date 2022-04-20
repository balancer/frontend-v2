import { getAddress } from '@ethersproject/address';

import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';

import AaveSubgraphService, {
  aaveSubgraphService
} from './subgraph/aave-subgraph.service';

export default class AaveService {
  subgraphService: AaveSubgraphService;

  constructor(subgraphService = aaveSubgraphService) {
    this.subgraphService = subgraphService;
  }

  public async calcWeightedSupplyAPRFor(
    mainTokens: string[],
    wrappedTokens: string[],
    wrappedTokenBalances: string[],
    totalLiquidity: string,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    let total = bnum(0);
    const breakdown: Record<string, string> = {};

    const reserves = await this.subgraphService.reserves.get({
      where: {
        underlyingAsset_in: mainTokens,
        isActive: true
      }
    });

    reserves.forEach(reserve => {
      const supplyAPR = bnum(reserve.supplyAPR);

      if (supplyAPR.gt(0)) {
        const tokenIndex = mainTokens.findIndex(
          token => token === getAddress(reserve.underlyingAsset)
        );
        // Grabs the matching wrapped which generates the yield
        const wrappedToken = wrappedTokens[tokenIndex];
        const mainToken = mainTokens[tokenIndex];

        if (prices[mainToken] != null) {
          const price = prices[mainToken][currency] || 0;
          const balance = wrappedTokenBalances[tokenIndex];
          const value = bnum(balance).times(price);
          const weightedAPR = value.times(supplyAPR).div(totalLiquidity);

          breakdown[wrappedToken] = weightedAPR.toString();

          total = total.plus(weightedAPR);
        }
      }
    });

    return {
      total: total.toString(),
      breakdown
    };
  }
}

export const aaveService = new AaveService();
